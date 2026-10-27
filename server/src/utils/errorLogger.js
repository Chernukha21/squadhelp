const fs = require('fs').promises;
const path = require('path');
const { v4: uuid } = require('uuid');

const LOGS_DIRECTORY = path.resolve(__dirname, '..', '..', 'logs');
const ERROR_LOG_PATH = path.join(LOGS_DIRECTORY, 'errors.log');
const ARCHIVE_DIRECTORY = path.join(LOGS_DIRECTORY, 'archive');

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

const archiveErrors = () => {
  writeQueue = writeQueue
    .then(async () => {
      let content;

      try {
        content = await fs.readFile(ERROR_LOG_PATH, 'utf8');
      } catch (error) {
        if (error.code === 'ENOENT') {
          return null;
        }

        throw error;
      }

      const lines = content
        .split(/\r?\n/)
        .filter(line => line.trim() !== '');

      if (lines.length === 0) {
        return null;
      }

      const archiveContent = lines
        .map(line => {
          const { message, code, time } = JSON.parse(line);

          return JSON.stringify({ message, code, time });
        })
        .join('\n');

      await fs.mkdir(ARCHIVE_DIRECTORY, { recursive: true });

      const archivePath = path.join(
        ARCHIVE_DIRECTORY,
        `errors-${Date.now()}-${uuid()}.log`
      );

      await fs.writeFile(archivePath, `${archiveContent}\n`, {
        encoding: 'utf8',
        flag: 'wx',
      });

      await fs.truncate(ERROR_LOG_PATH, 0);

      return archivePath;
    })
    .catch(error => {
      console.error('Cannot archive error log:', error);

      return null;
    });

  return writeQueue;
};

module.exports = { logError, archiveErrors  };
