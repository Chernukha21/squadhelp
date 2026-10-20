const db = require('../models');
const ServerError =require('../errors/ServerError');
const contestQueries = require('./queries/contestQueries');
const userQueries = require('./queries/userQueries');
const controller = require('../socketInit');
const UtilFunctions = require('../utils/functions');
const CONSTANTS = require('../constants');
const BadRequestError = require('../errors/BadRequestError');



module.exports.dataForContest = async (req, res, next) => {
  const response = {};
  try {
    const { body: { characteristic1, characteristic2 } } = req;
    console.log(req.body, characteristic1, characteristic2);
    const types = [characteristic1, characteristic2, 'industry'].filter(Boolean);

    const characteristics = await db.Selects.findAll({
      where: {
        type: {
          [ db.Sequelize.Op.or ]: types,
        },
      },
    });
    if (!characteristics) {
      return next(new ServerError());
    }
    characteristics.forEach(characteristic => {
      if (!response[ characteristic.type ]) {
        response[ characteristic.type ] = [];
      }
      response[ characteristic.type ].push(characteristic.describe);
    });
    res.send(response);
  } catch (err) {
    console.log(err);
    next(new ServerError('cannot get contest preferences'));
  }
};

module.exports.getContestById = async (req, res, next) => {
  try {
    let contestInfo = await db.Contests.findOne({
      where: { id: req.headers.contestid },
      order: [
        [db.Offers, 'id', 'asc'],
      ],
      include: [
        {
          model: db.Users,
          required: true,
          attributes: {
            exclude: [
              'password',
              'role',
              'balance',
              'accessToken',
            ],
          },
        },
        {
          model: db.Offers,
          required: false,
          where: req.tokenData.role === CONSTANTS.CREATOR
            ? { userId: req.tokenData.userId }
            : {},
          attributes: { exclude: ['userId', 'contestId'] },
          include: [
            {
              model: db.Users,
              required: true,
              attributes: {
                exclude: [
                  'password',
                  'role',
                  'balance',
                  'accessToken',
                ],
              },
            },
            {
              model: db.Ratings,
              required: false,
              where: { userId: req.tokenData.userId },
              attributes: { exclude: ['userId', 'offerId'] },
            },
          ],
        },
      ],
    });
    contestInfo = contestInfo.get({ plain: true });
    contestInfo.Offers.forEach(offer => {
      if (offer.Rating) {
        offer.mark = offer.Rating.mark;
      }
      delete offer.Rating;
    });
    res.send(contestInfo);
  } catch (e) {
    next(new ServerError());
  }
};

module.exports.downloadFile = async (req, res, next) => {
  const file = CONSTANTS.CONTESTS_DEFAULT_DIR + req.params.fileName;
  res.download(file);
};

module.exports.updateContest = async (req, res, next) => {
  if (req.file) {
    req.body.fileName = req.file.filename;
    req.body.originalFileName = req.file.originalname;
  }
  const contestId = req.body.contestId;
  delete req.body.contestId;
  try {
    const updatedContest = await contestQueries.updateContest(req.body, {
      id: contestId,
      userId: req.tokenData.userId,
    });
    res.send(updatedContest);
  } catch (e) {
    next(e);
  }
};

module.exports.setNewOffer = async (req, res, next) => {
  try {
    const contestId = Number(req.body.contestId);

    if (!Number.isInteger(contestId) || contestId <= 0) {
      return next(
        new BadRequestError('Invalid contest ID')
      );
    }

    const contest = await db.Contests.findOne({
      where: {
        id: contestId,
      },
      attributes: [
        'id',
        'userId',
        'contestType',
        'status',
      ],
    });

    if (!contest) {
      return next(
        new BadRequestError('Contest not found')
      );
    }

    if (
      contest.status !== CONSTANTS.CONTEST_STATUS_ACTIVE
    ) {
      return next(
        new BadRequestError(
          'Offers can only be submitted to active contests'
        )
      );
    }

    const offer = {
      userId: req.tokenData.userId,
      contestId,
    };

    if (contest.contestType === CONSTANTS.LOGO_CONTEST) {
      if (!req.file) {
        return next(
          new BadRequestError('Image is required')
        );
      }

      offer.fileName = req.file.filename;
      offer.originalFileName = req.file.originalname;
    } else {
      const { offerData } = req.body;

      if (typeof offerData !== 'string') {
        return next(
          new BadRequestError('Suggestion is required')
        );
      }

      const normalizedOffer = offerData.trim();

      if (!normalizedOffer) {
        return next(
          new BadRequestError('Suggestion is required')
        );
      }

      if (normalizedOffer.length > 255) {
        return next(
          new BadRequestError(
            'Suggestion must be 255 characters or less'
          )
        );
      }

      offer.text = normalizedOffer;
    }

    const createdOffer =
      await contestQueries.createOffer(offer);

    const responseOffer =
      typeof createdOffer.get === 'function'
        ? createdOffer.get({ plain: true })
        : { ...createdOffer };

    delete responseOffer.contestId;
    delete responseOffer.userId;

    controller
      .getNotificationController()
      .emitEntryCreated(
        String(contest.userId),
        contestId
      );

    const User = {
      ...req.tokenData,
      id: req.tokenData.userId,
    };

    return res.send({
      ...responseOffer,
      User,
    });
  } catch (error) {
    return next(
      new ServerError('Cannot create offer')
    );
  }
};

const rejectOffer = async (offerId, creatorId, contestId) => {
  const rejectedOffer = await contestQueries.updateOffer(
    { status: CONSTANTS.OFFER_STATUS_REJECTED }, { id: offerId });
  controller.getNotificationController().emitChangeOfferStatus(creatorId,
    'Someone of yours offers was rejected', contestId);
  return rejectedOffer;
};

const resolveOffer = async (
  contestId,
  creatorId,
  orderId,
  offerId,
  priority,
  transaction
) => {
  const finishedContest = await contestQueries.updateContestStatus({
    status: db.sequelize.literal(`CASE
            WHEN "id"=${ contestId }  AND "orderId"='${ orderId }'
            THEN '${ CONSTANTS.CONTEST_STATUS_FINISHED }'
            WHEN "orderId"='${orderId}' AND "priority"=${Number(priority) + 1}
            THEN '${ CONSTANTS.CONTEST_STATUS_ACTIVE }'
            ELSE '${ CONSTANTS.CONTEST_STATUS_PENDING }'
            END
    `),
  }, { orderId }, transaction);
  await userQueries.updateUser(
    { balance: db.sequelize.literal('balance + ' + finishedContest.prize) },
    creatorId, transaction);
  const updatedOffers = await contestQueries.updateOfferStatus(
    {
      status: db.sequelize.literal(`CASE
      WHEN "id"=${offerId}
        THEN '${CONSTANTS.OFFER_STATUS_WON}'
      ELSE '${CONSTANTS.OFFER_STATUS_REJECTED}'
    END`),
    },
    {
      contestId,
      status: CONSTANTS.OFFER_STATUS_PENDING,
    },
    transaction
  );
  const winningOffer = updatedOffers.find(
    offer => String(offer.id) === String(offerId)
  );
  if (!winningOffer) {
    throw new ServerError('Offer has already been processed');
  }

  await transaction.commit();

  const rejectedCreatorIds = [
    ...new Set(
      updatedOffers
        .filter(
          offer =>
            offer.status === CONSTANTS.OFFER_STATUS_REJECTED &&
            String(offer.userId) !== String(creatorId)
        )
        .map(offer => String(offer.userId))
    ),
  ];

  if (rejectedCreatorIds.length > 0) {
    controller
      .getNotificationController()
      .emitChangeOfferStatus(
        rejectedCreatorIds,
        'Your offer was rejected',
        contestId
      );
  }

  controller
    .getNotificationController()
    .emitChangeOfferStatus(
      String(creatorId),
      'Your offer won the contest',
      contestId
    );
  return winningOffer?.dataValues ?? winningOffer;
};

module.exports.setOfferStatus = async (req, res, next) => {
  let transaction;
  if (req.body.command === 'reject') {
    try {
      const offer = await rejectOffer(req.body.offerId, req.body.creatorId,
        req.body.contestId);
      res.send(offer);
    } catch (err) {
      next(err);
    }
}else if (req.body.command === 'resolve') {
    try {
      transaction = await db.sequelize.transaction();

      const winningOffer = await resolveOffer(
        req.body.contestId,
        req.body.creatorId,
        req.body.orderId,
        req.body.offerId,
        req.body.priority,
        transaction
      );

      res.send(winningOffer);
    } catch (err) {
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }

      next(err);
    }
  }
};

module.exports.getCustomersContests = (req, res, next) => {
  db.Contests.findAll({
    where: { status: req.headers.status, userId: req.tokenData.userId },
    limit: req.body.limit,
    offset: req.body.offset ? req.body.offset : 0,
    order: [['id', 'DESC']],
    include: [
      {
        model: db.Offers,
        required: false,
        attributes: ['id'],
      },
    ],
  })
    .then(contests => {
      contests.forEach(
        contest => contest.dataValues.count = contest.dataValues.Offers.length);
      let haveMore = true;
      if (contests.length === 0) {
        haveMore = false;
      }
      res.send({ contests, haveMore });
    })
    .catch(err => next(new ServerError(err)));
};

module.exports.getContests = (req, res, next) => {
  const predicates = UtilFunctions.createWhereForAllContests(req.body.typeIndex,
    req.body.contestId, req.body.industry, req.body.awardSort);
  db.Contests.findAll({
    where: predicates.where,
    order: predicates.order,
    limit: req.body.limit,
    offset: req.body.offset ? req.body.offset : 0,
    include: [
      {
        model: db.Offers,
        required: req.body.ownEntries,
        where: req.body.ownEntries ? { userId: req.tokenData.userId } : {},
        attributes: ['id'],
      },
    ],
  })
    .then(contests => {
      contests.forEach(
        contest => contest.dataValues.count = contest.dataValues.Offers.length);
      let haveMore = true;
      if (contests.length === 0) {
        haveMore = false;
      }
      res.send({ contests, haveMore });
    })
    .catch(err => {
      next(new ServerError());
    });
};
