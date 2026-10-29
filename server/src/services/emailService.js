const nodemailer = require('nodemailer');
const CONSTANTS = require('../constants');

let transporter;

const getTransporter = () => {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASSWORD,
  } = process.env;

  if (
    !SMTP_HOST ||
    !SMTP_PORT ||
    !SMTP_USER ||
    !SMTP_PASSWORD
  ) {
    throw new Error('SMTP configuration is incomplete');
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: SMTP_SECURE === 'true',
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    });
  }

  return transporter;
};

const sendOfferModerationEmail = async ({
                                          email,
                                          creatorName,
                                          offerId,
                                          contestId,
                                          decision,
                                        }) => {
  const isApproved =
    decision ===
    CONSTANTS.OFFER_MODERATION_STATUS_APPROVED;

  const decisionText = isApproved
    ? 'approved'
    : 'rejected';

  const subject = `Your offer #${offerId} was ${decisionText}`;

  const text = [
    `Hello${creatorName ? `, ${creatorName}` : ''}!`,
    '',
    `Your offer #${offerId} for contest #${contestId} was ${decisionText} by the moderator.`,
    '',
    isApproved
      ? 'The customer can now see your offer.'
      : 'The offer will not be shown to the customer.',
    '',
    'Squadhelp team',
  ].join('\n');

  return getTransporter().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject,
    text,
  });
};

const verifyEmailConnection = () =>
  getTransporter().verify();

module.exports = {
  sendOfferModerationEmail,
  verifyEmailConnection,
};
