const db = require('../models');
const jwt = require('jsonwebtoken');
const CONSTANTS = require('../constants');
const TokenError = require('../errors/TokenError');
const userQueries = require('../controllers/queries/userQueries');

module.exports.checkAuth = async (req, res, next) => {
  const accessToken = req.headers.authorization;

  if (!accessToken) {
    return next(new TokenError());
  }

  try {
    const tokenData = jwt.verify(
      accessToken,
      CONSTANTS.JWT_SECRET
    );

    const foundUser = await userQueries.findUser({
      id: tokenData.userId,
    });

    return res.send({
      firstName: foundUser.firstName,
      lastName: foundUser.lastName,
      role: foundUser.role,
      id: foundUser.id,
      avatar: foundUser.avatar,
      displayName: foundUser.displayName,
      balance: foundUser.balance,
      email: foundUser.email,
    });
  } catch (error) {
    return next(new TokenError());
  }
};

module.exports.checkToken = async (req, res, next) => {
  const accessToken = req.headers.authorization;

  if (!accessToken) {
    return next(new TokenError('need token'));
  }

  let tokenData;

  try {
    tokenData = jwt.verify(
      accessToken,
      CONSTANTS.JWT_SECRET
    );
  } catch (error) {
    return next(new TokenError());
  }

  let user;

  try {
    user = await db.Users.findByPk(tokenData.userId, {
      attributes: ['id', 'role'],
    });
  } catch (error) {
    return next(error);
  }

  if (!user) {
    return next(new TokenError());
  }

  req.tokenData = {
    ...tokenData,
    userId: user.id,
    role: user.role,
  };

  return next();
};
