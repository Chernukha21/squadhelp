const ApplicationError = require('./ApplicationError');

class TokenError extends ApplicationError {
  constructor(message) {
    super(message || 'Unauthorized', 401);
  }
}

module.exports = TokenError;
