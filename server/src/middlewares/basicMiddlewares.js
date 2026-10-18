const bd = require('../models');
const NotFound = require('../errors/UserNotFoundError');
const RightsError = require('../errors/RightsError');
const ServerError = require('../errors/ServerError');
const CONSTANTS = require('../constants');
const BadRequestError = require('../errors/BadRequestError');

module.exports.parseBody = (req, res, next) => {
  req.body.contests = JSON.parse(req.body.contests);
  for (let i = 0; i < req.body.contests.length; i++) {
    if (req.body.contests[ i ].haveFile) {
      const file = req.files.splice(0, 1);
      if (!file[0]) {
        return next(new BadRequestError('Contest attachment is missing'));
      }
      req.body.contests[ i ].fileName = file[ 0 ].filename;
      req.body.contests[ i ].originalFileName = file[ 0 ].originalname;
    }
  }
  next();
};

module.exports.canGetContest = async (req, res, next) => {
  let result = null;
  try {
    if (req.tokenData.role === CONSTANTS.CUSTOMER) {
      result = await bd.Contests.findOne({
        where: { id: req.headers.contestid, userId: req.tokenData.userId },
      });
    } else if (req.tokenData.role === CONSTANTS.CREATOR) {
      result = await bd.Contests.findOne({
        where: {
          id: req.headers.contestid,
          status: {
            [ bd.Sequelize.Op.or ]: [
              CONSTANTS.CONTEST_STATUS_ACTIVE,
              CONSTANTS.CONTEST_STATUS_FINISHED,
            ],
          },
        },
      });
    }
    result ? next() : next(new RightsError());
  } catch (e) {
    next(new ServerError(e));
  }
};

module.exports.onlyForCreative = (req, res, next) => {
  if (req.tokenData.role === CONSTANTS.CUSTOMER) {
    next(new RightsError());
  } else {
    next();
  }

};

module.exports.onlyForCustomer = (req, res, next) => {
  if (req.tokenData.role === CONSTANTS.CREATOR) {
    return next(new RightsError('this page only for customers'));
  } else {
    next();
  }
};

module.exports.canSendOffer = async (req, res, next) => {
  if (req.tokenData.role === CONSTANTS.CUSTOMER) {
    return next(new RightsError());
  }
  try {
    const result = await bd.Contests.findOne({
      where: {
        id: req.body.contestId,
      },
      attributes: ['status'],
    });
    if (result.get({ plain: true }).status ===
      CONSTANTS.CONTEST_STATUS_ACTIVE) {
      next();
    } else {
      return next(new RightsError());
    }
  } catch (e) {
    next(new ServerError());
  }

};

module.exports.onlyForCustomerWhoCreateContest = async (req, res, next) => {
  try {
    if (req.tokenData.role !== CONSTANTS.CUSTOMER) {
      return next(new RightsError('Only customers can change offer status'));
    }

    const contest = await bd.Contests.findByPk(req.body.contestId, {
      attributes: ['id', 'userId', 'status'],
    });

    if (!contest) {
      return next(new RightsError('Contest not found'));
    }

    if (contest.userId !== req.tokenData.userId) {
      return next(new RightsError('You are not the owner of this contest'));
    }

    if (contest.status !== CONSTANTS.CONTEST_STATUS_ACTIVE) {
      return next(
        new RightsError(`Contest is not active. Current status: ${contest.status}`)
      );
    }

    return next();
  } catch (error) {
    return next(new ServerError(error));
  }
};

module.exports.canUpdateContest = async (req, res, next) => {
  try {
    const result = bd.Contests.findOne({
      where: {
        userId: req.tokenData.userId,
        id: req.body.contestId,
        status: { [ bd.Sequelize.Op.not ]: CONSTANTS.CONTEST_STATUS_FINISHED },
      },
    });
    if (!result) {
      return next(new RightsError());
    }
    next();
  } catch (e) {
    next(new ServerError());
  }
};

