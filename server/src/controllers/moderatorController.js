const db = require('../models');
const CONSTANTS = require('../constants');
const controller = require('../socketInit');
const BadRequestError = require('../errors/BadRequestError');
const ServerError = require('../errors/ServerError');
const {
  sendOfferModerationEmail,
} = require('../services/emailService');

const MODERATION_STATUSES = [
  CONSTANTS.OFFER_MODERATION_STATUS_PENDING,
  CONSTANTS.OFFER_MODERATION_STATUS_APPROVED,
  CONSTANTS.OFFER_MODERATION_STATUS_REJECTED,
];

const getSafeOffer = offer => ({
  id: offer.id,
  contestId: offer.contestId,
  text: offer.text,
  fileName: offer.fileName,
  originalFileName: offer.originalFileName,
  status: offer.status,
  moderationStatus: offer.moderationStatus,
});

module.exports.getOffers = async (req, res, next) => {
  try {
    const requestedPage = Number.parseInt(
      req.query.page,
      10
    );

    const requestedLimit = Number.parseInt(
      req.query.limit,
      10
    );

    const page =
      Number.isInteger(requestedPage) &&
      requestedPage > 0
        ? requestedPage
        : 1;

    const limit =
      Number.isInteger(requestedLimit) &&
      requestedLimit > 0
        ? Math.min(requestedLimit, 50)
        : 20;

    const where = {};

    if (req.query.moderationStatus) {
      if (
        !MODERATION_STATUSES.includes(
          req.query.moderationStatus
        )
      ) {
        return next(
          new BadRequestError(
            'Invalid moderation status'
          )
        );
      }

      where.moderationStatus =
        req.query.moderationStatus;
    }

    const { count, rows } =
      await db.Offers.findAndCountAll({
        where,
        attributes: [
          'id',
          'contestId',
          'text',
          'fileName',
          'originalFileName',
          'status',
          'moderationStatus',
        ],
        order: [['id', 'DESC']],
        limit,
        offset: (page - 1) * limit,
      });

    return res.send({
      offers: rows,
      pagination: {
        page,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    return next(
      new ServerError('Cannot get offers')
    );
  }
};

module.exports.moderateOffer = async (
  req,
  res,
  next
) => {
  try {
    const offerId = Number(req.params.offerId);
    const { decision } = req.body;

    if (
      !Number.isInteger(offerId) ||
      offerId <= 0
    ) {
      return next(
        new BadRequestError('Invalid offer ID')
      );
    }

    const allowedDecisions = [
      CONSTANTS.OFFER_MODERATION_STATUS_APPROVED,
      CONSTANTS.OFFER_MODERATION_STATUS_REJECTED,
    ];

    if (!allowedDecisions.includes(decision)) {
      return next(
        new BadRequestError(
          'Decision must be approved or rejected'
        )
      );
    }

    const pendingOffer = await db.Offers.findOne({
      where: {
        id: offerId,
        moderationStatus:
        CONSTANTS.OFFER_MODERATION_STATUS_PENDING,
      },
      attributes: [
        'id',
        'userId',
        'contestId',
      ],
    });

    if (!pendingOffer) {
      return next(
        new BadRequestError(
          'Offer not found or already moderated'
        )
      );
    }

    let contest = null;

    if (
      decision ===
      CONSTANTS.OFFER_MODERATION_STATUS_APPROVED
    ) {
      contest = await db.Contests.findByPk(
        pendingOffer.contestId,
        {
          attributes: ['id', 'userId'],
        }
      );

      if (!contest) {
        return next(
          new BadRequestError('Contest not found')
        );
      }
    }

    const [updatedCount, updatedOffers] =
      await db.Offers.update(
        {
          moderationStatus: decision,
        },
        {
          where: {
            id: offerId,
            moderationStatus:
            CONSTANTS.OFFER_MODERATION_STATUS_PENDING,
          },
          returning: true,
        }
      );

    if (updatedCount === 0) {
      return next(
        new BadRequestError(
          'Offer has already been moderated'
        )
      );
    }

    const updatedOffer = updatedOffers[0];

    if (
      decision ===
      CONSTANTS.OFFER_MODERATION_STATUS_APPROVED
    ) {
      controller
        .getNotificationController()
        .emitEntryCreated(
          String(contest.userId),
          contest.id
        );
    }

    const creatorMessage =
      decision ===
      CONSTANTS.OFFER_MODERATION_STATUS_APPROVED
        ? 'Your offer was approved by moderator'
        : 'Your offer was rejected by moderator';

    controller
      .getNotificationController()
      .emitChangeOfferStatus(
        String(pendingOffer.userId),
        creatorMessage,
        pendingOffer.contestId
      );

    try {
      const creator = await db.Users.findByPk(
        pendingOffer.userId,
        {
          attributes: [
            'email',
            'displayName',
            'firstName',
          ],
        }
      );

      if (!creator) {
        throw new Error(
          `Creative for offer #${offerId} was not found`
        );
      }

      await sendOfferModerationEmail({
        email: creator.email,
        creatorName:
          creator.displayName || creator.firstName,
        offerId: updatedOffer.id,
        contestId: updatedOffer.contestId,
        decision,
      });
    } catch (emailError) {
      console.error(
        `Cannot send moderation email for offer #${offerId}:`,
        emailError
      );
    }

    return res.send(
      getSafeOffer(updatedOffer)
    );
  } catch (error) {
    return next(
      new ServerError('Cannot moderate offer')
    );
  }
};
