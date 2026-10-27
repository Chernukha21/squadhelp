const fs = require('fs').promises;
const path = require('path');

const LOGS_DIRECTORY = path.resolve(__dirname, '..', '..', 'logs');
const ERROR_LOG_PATH = path.join(LOGS_DIRECTORY, 'errors.log');

let writeQueue = Promise.resolve();

const logError = error => {
  const isErrorStatusCode =
    Number.isInteger(error.code) &&
    error.code >= 400 &&
    error.code <= 599;

  const record = {
    message: error.message || 'Unknown error',
    time: Date.now(),
    code: isErrorStatusCode ? error.code : 500,
    stackTrace: {
      name: error.name || 'Error',
      stack: error.stack || '',
    },
  };

  writeQueue = writeQueue
    .then(async () => {
      await fs.mkdir(LOGS_DIRECTORY, { recursive: true });

      await fs.appendFile(
        ERROR_LOG_PATH,
        `${JSON.stringify(record)}\n`,
        'utf8'
      );
    })
    .catch(writeError => {
      console.error('Cannot write error log:', writeError);
    });

  return writeQueue;
};

module.exports = { logError };
