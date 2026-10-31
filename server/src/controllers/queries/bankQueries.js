const db = require('../../models');
const CONSTANTS = require('../../constants');
const BankDeclineError = require('../../errors/BankDeclineError');

module.exports.updateBankBalance = async (
  {
    cardNumber,
    cvc,
    expiry,
    amount,
  },
  transaction,
) => {
  const paymentAmount = Number(amount);

  if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
    throw new BankDeclineError('Invalid payment amount');
  }

  if (cardNumber === CONSTANTS.SQUADHELP_BANK_NUMBER) {
    throw new BankDeclineError('Invalid payment card');
  }

  const customerBank = await db.Banks.findOne({
    where: {
      cardNumber,
      cvc,
      expiry,
    },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  const squadhelpBank = await db.Banks.findOne({
    where: {
      cardNumber: CONSTANTS.SQUADHELP_BANK_NUMBER,
      cvc: CONSTANTS.SQUADHELP_BANK_CVC,
      expiry: CONSTANTS.SQUADHELP_BANK_EXPIRY,
    },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!customerBank || !squadhelpBank) {
    throw new BankDeclineError('Invalid payment details');
  }

  if (Number(customerBank.balance) < paymentAmount) {
    throw new BankDeclineError('Not enough money');
  }

  await customerBank.decrement('balance', {
    by: paymentAmount,
    transaction,
  });

  await squadhelpBank.increment('balance', {
    by: paymentAmount,
    transaction,
  });
};
