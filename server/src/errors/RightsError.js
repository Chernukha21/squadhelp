const ApplicationError = require('./ApplicationError');

class RightsError extends ApplicationError {
  constructor(message) {
    super(message || 'Not enough rights', 403);
  }
}
module.exports = RightsError;
