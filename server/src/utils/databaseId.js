const { randomBytes } = require('crypto');

const createDatabaseId = () =>
  randomBytes(12).toString('hex');

module.exports = createDatabaseId;
