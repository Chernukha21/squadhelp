const ApplicationError = require('./ApplicationError');

class BadRequestError extends ApplicationError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

module.exports = BadRequestError;
