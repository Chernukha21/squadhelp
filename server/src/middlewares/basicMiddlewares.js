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
  if (req.tokenData.role !== CONSTANTS.CREATOR) {
    return next(new RightsError('This action is only for creatives'));
  }

  return next();
};

module.exports.onlyForCustomer = (req, res, next) => {
  if (req.tokenData.role !== CONSTANTS.CUSTOMER) {
    return next(new RightsError('This action is only for customers'));
  }

  return next();
};

module.exports.onlyForModerator = (req, res, next) => {
  if (req.tokenData.role !== CONSTANTS.MODERATOR) {
    return next(new RightsError('This action is only for moderators'));
  }

  return next();
};

module.exports.onlyForRegularUsers = (req, res, next) => {
  const allowedRoles = [
    CONSTANTS.CUSTOMER,
    CONSTANTS.CREATOR,
  ];

  if (!allowedRoles.includes(req.tokenData.role)) {
    return next(
      new RightsError('This action is not available for moderators'),
    );
  }

  return next();
};

module.exports.canSendOffer = async (req, res, next) => {
  if (req.tokenData.role !== CONSTANTS.CREATOR) {
    return next(new RightsError('Only creatives can submit offers'));
  }

  try {
    const contest = await bd.Contests.findOne({
      where: {
        id: req.body.contestId,
      },
      attributes: ['status'],
    });

    if (!contest) {
      return next(new BadRequestError('Contest not found'));
    }

    if (contest.status !== CONSTANTS.CONTEST_STATUS_ACTIVE) {
      return next(
        new RightsError('Offers can only be submitted to active contests'),
      );
    }

    return next();
  } catch (error) {
    return next(new ServerError(error));
  }
};

module.exports.onlyForCustomerWhoCreateContest = async (
  req,
  res,
  next,
) => {
  try {
    if (
      req.tokenData.role !== CONSTANTS.CUSTOMER
    ) {
      return next(
        new RightsError(
          'Only customers can change offer status',
        ),
      );
    }

    const contestId = Number(req.body.contestId);
    const offerId = Number(req.body.offerId);

    if (
      !Number.isInteger(contestId) ||
      contestId <= 0 ||
      !Number.isInteger(offerId) ||
      offerId <= 0
    ) {
      return next(
        new BadRequestError(
          'Invalid contest or offer ID',
        ),
      );
    }

    const contest = await bd.Contests.findByPk(
      contestId,
      {
        attributes: [
          'id',
          'userId',
          'status',
          'orderId',
          'priority',
        ],
      },
    );

    if (!contest) {
      return next(
        new RightsError('Contest not found'),
      );
    }

    if (
      contest.userId !== req.tokenData.userId
    ) {
      return next(
        new RightsError(
          'You are not the owner of this contest',
        ),
      );
    }

    if (
      contest.status !==
      CONSTANTS.CONTEST_STATUS_ACTIVE
    ) {
      return next(
        new RightsError(
          `Contest is not active. Current status: ${contest.status}`,
        ),
      );
    }

    const offer = await bd.Offers.findOne({
      where: {
        id: offerId,
        contestId,
        status: CONSTANTS.OFFER_STATUS_PENDING,
        moderationStatus:
        CONSTANTS.OFFER_MODERATION_STATUS_APPROVED,
      },
      attributes: [
        'id',
        'userId',
        'contestId',
        'status',
        'moderationStatus',
      ],
    });

    if (!offer) {
      return next(
        new RightsError(
          'Offer is not approved or has already been processed',
        ),
      );
    }

    req.contestForDecision = contest;
    req.offerForDecision = offer;

    return next();
  } catch (error) {
    return next(new ServerError(error));
  }
};

module.exports.canUpdateContest = async (req, res, next) => {
  if (req.tokenData.role !== CONSTANTS.CUSTOMER) {
    return next(new RightsError('Only customers can update contests'));
  }

  try {
    const contest = await bd.Contests.findOne({
      where: {
        userId: req.tokenData.userId,
        id: req.body.contestId,
        status: {
          [bd.Sequelize.Op.not]: CONSTANTS.CONTEST_STATUS_FINISHED,
        },
      },
    });

    if (!contest) {
      return next(
        new RightsError('Contest not found or cannot be updated'),
      );
    }

    return next();
  } catch (error) {
    return next(new ServerError(error));
  }
};

