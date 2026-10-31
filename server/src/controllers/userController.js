const jwt = require('jsonwebtoken');
const CONSTANTS = require('../constants');
const bd = require('../models');
const NotUniqueEmail = require('../errors/NotUniqueEmail');
const moment = require('moment');
const { v4: uuid } = require('uuid');
const controller = require('../socketInit');
const userQueries = require('./queries/userQueries');
const bankQueries = require('./queries/bankQueries');
const ratingQueries = require('./queries/ratingQueries');
const BadRequestError = require('../errors/BadRequestError');

module.exports.login = async (req, res, next) => {
  try {
    const foundUser = await userQueries.findUser({ email: req.body.email });
    await userQueries.passwordCompare(req.body.password, foundUser.password);
    const accessToken = jwt.sign({
      firstName: foundUser.firstName,
      userId: foundUser.id,
      role: foundUser.role,
      lastName: foundUser.lastName,
      avatar: foundUser.avatar,
      displayName: foundUser.displayName,
      balance: foundUser.balance,
      email: foundUser.email,
      rating: foundUser.rating,
    }, CONSTANTS.JWT_SECRET, { expiresIn: CONSTANTS.ACCESS_TOKEN_TIME });
    await userQueries.updateUser({ accessToken }, foundUser.id);
    res.send({ token: accessToken });
  } catch (err) {
    next(err);
  }
};
module.exports.registration = async (req, res, next) => {
  try {
    const { firstName, lastName, displayName, email, role } = req.body;

    const publicRoles = [
      CONSTANTS.CUSTOMER,
      CONSTANTS.CREATOR,
    ];

    if (!publicRoles.includes(role)) {
      return next(
        new BadRequestError('Only customer and creator can register'),
      );
    }

    const newUser = await userQueries.userCreation({
      firstName,
      lastName,
      displayName,
      email,
      role,
      password: req.hashPass,
    });
    const accessToken = jwt.sign({
      firstName: newUser.firstName,
      userId: newUser.id,
      role: newUser.role,
      lastName: newUser.lastName,
      avatar: newUser.avatar,
      displayName: newUser.displayName,
      balance: newUser.balance,
      email: newUser.email,
      rating: newUser.rating,
    }, CONSTANTS.JWT_SECRET, { expiresIn: CONSTANTS.ACCESS_TOKEN_TIME });
    await userQueries.updateUser({ accessToken }, newUser.id);
    return res.send({ token: accessToken });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return  next(new NotUniqueEmail());
    } else {
      return next(err);
    }
  }
};

function getQuery (offerId, userId, mark, isFirst, transaction) {
  const getCreateQuery = () => ratingQueries.createRating({
    offerId,
    mark,
    userId,
  }, transaction);
  const getUpdateQuery = () => ratingQueries.updateRating({ mark },
    { offerId, userId }, transaction);
  return isFirst ? getCreateQuery : getUpdateQuery;
}

module.exports.changeMark = async (req, res, next) => {
  let sum = 0;
  let avg = 0;
  let transaction;
  const { isFirst, offerId, mark, creatorId } = req.body;
  const userId = req.tokenData.userId;
  try {
    transaction = await bd.sequelize.transaction(
      { isolationLevel: bd.Sequelize.Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED });
    const query = getQuery(offerId, userId, mark, isFirst, transaction);
    await query();
    const offersArray = await bd.Ratings.findAll({
      include: [
        {
          model: bd.Offers,
          required: true,
          where: { userId: creatorId },
        },
      ],
      transaction,
    });
    for (let i = 0; i < offersArray.length; i++) {
      sum += offersArray[ i ].dataValues.mark;
    }
    avg = sum / offersArray.length;

    await userQueries.updateUser({ rating: avg }, creatorId, transaction);
    transaction.commit();
    controller.getNotificationController().emitChangeMark(creatorId);
    res.send({ userId: creatorId, rating: avg });
  } catch (err) {
    transaction.rollback();
    next(err);
  }
};

module.exports.payment = async (req, res, next) => {
  let transaction;

  try {
    if (
      !Array.isArray(req.body.contests) ||
      req.body.contests.length === 0
    ) {
      throw new BadRequestError('Contests are required');
    }

    const allowedDomainPreferences = Object.values(
      CONSTANTS.DOMAIN_PREFERENCES,
    );

    const orderId = uuid();

    const contests = req.body.contests.map((contest, index) => {
      const isNameContest =
        contest.contestType === CONSTANTS.NAME_CONTEST;

      if (
        isNameContest &&
        !allowedDomainPreferences.includes(contest.domainPreference)
      ) {
        throw new BadRequestError(
          'Invalid domain preference',
        );
      }

      const prize =
        index === req.body.contests.length - 1
          ? Math.ceil(req.body.price / req.body.contests.length)
          : Math.floor(req.body.price / req.body.contests.length);

      return {
        ...contest,

        domainPreference: isNameContest
          ? contest.domainPreference
          : null,

        status:
          index === 0
            ? CONSTANTS.CONTEST_STATUS_ACTIVE
            : CONSTANTS.CONTEST_STATUS_PENDING,

        userId: req.tokenData.userId,
        priority: index + 1,
        orderId,
        createdAt: moment().format('YYYY-MM-DD HH:mm'),
        prize,
      };
    });

    transaction = await bd.sequelize.transaction();

    await bankQueries.updateBankBalance(
      {
        cardNumber: req.body.number.replace(/\s/g, ''),
        cvc: req.body.cvc,
        expiry: req.body.expiry,
        amount: req.body.price,
      },
      transaction,
    );

    await bd.Contests.bulkCreate(contests, {
      transaction,
    });

    await transaction.commit();

    return res.send();
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }

    return next(error);
  }
};

module.exports.updateUser = async (req, res, next) => {
  try {
    const body = req.body || {};

    const allowedFields = [
      'firstName',
      'lastName',
      'displayName',
      'email',
    ];

    const updates = {};

    allowedFields.forEach(field => {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        updates[field] = body[field];
      }
    });

    if (req.file) {
      updates.avatar = req.file.filename;
    }

    if (Object.keys(updates).length === 0) {
      return next(
        new BadRequestError('No supported profile fields provided'),
      );
    }

    const updatedUser = await userQueries.updateUser(
      updates,
      req.tokenData.userId,
    );

    return res.send({
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      displayName: updatedUser.displayName,
      avatar: updatedUser.avatar,
      email: updatedUser.email,
      balance: updatedUser.balance,
      role: updatedUser.role,
      id: updatedUser.id,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports.cashout = async (req, res, next) => {
  let transaction;
  try {
    transaction = await bd.sequelize.transaction();
    const updatedUser = await userQueries.updateUser(
      { balance: bd.sequelize.literal('balance - ' + req.body.sum) },
      req.tokenData.userId, transaction);
    await bankQueries.updateBankBalance({
      balance: bd.sequelize.literal(`CASE 
                WHEN "cardNumber"='${ req.body.number.replace(/ /g,
    '') }' AND "expiry"='${ req.body.expiry }' AND "cvc"='${ req.body.cvc }'
                    THEN "balance"+${ req.body.sum }
                WHEN "cardNumber"='${ CONSTANTS.SQUADHELP_BANK_NUMBER }' AND "expiry"='${ CONSTANTS.SQUADHELP_BANK_EXPIRY }' AND "cvc"='${ CONSTANTS.SQUADHELP_BANK_CVC }'
                    THEN "balance"-${ req.body.sum }
                 END
                `),
    },
    {
      cardNumber: {
        [ bd.Sequelize.Op.in ]: [
          CONSTANTS.SQUADHELP_BANK_NUMBER,
          req.body.number.replace(/ /g, ''),
        ],
      },
    },
    transaction);
    transaction.commit();
    res.send({ balance: updatedUser.balance });
  } catch (err) {
    transaction.rollback();
    next(err);
  }
};


