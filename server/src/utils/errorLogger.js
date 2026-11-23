const fs = require('fs').promises;
const path = require('path');

const LOGS_DIRECTORY = process.env.ERROR_LOG_DIRECTORY
  ? path.resolve(process.env.ERROR_LOG_DIRECTORY)
  : path.resolve(__dirname, '..', '..', 'logs');
const ERROR_LOG_PATH = path.join(LOGS_DIRECTORY, 'errors.log');
const ARCHIVE_DIRECTORY = path.join(LOGS_DIRECTORY, 'archive');

let initializationPromise;
let writeQueue = Promise.resolve();
let archiveQueue = Promise.resolve();

const initializeLogger = () => {
  if (!initializationPromise) {
    initializationPromise = Promise.all([
      fs.mkdir(LOGS_DIRECTORY, { recursive: true }),
      fs.mkdir(ARCHIVE_DIRECTORY, { recursive: true }),
    ]);
  }

  return initializationPromise;
};

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
    .then(() => initializeLogger())
    .then(() =>
      fs.appendFile(ERROR_LOG_PATH, `${JSON.stringify(record)}\n`, 'utf8'),
    )
    .catch(writeError => {
      console.error('Cannot write error log:', writeError);
    });

  return writeQueue;
};

const createArchiveFile = async (
  archiveDate,
  content,
  archiveNumber = 1,
) => {
  const suffix = archiveNumber === 1 ? '' : `-${archiveNumber}`;
  const archivePath = path.join(
    ARCHIVE_DIRECTORY,
    `errors-${archiveDate}${suffix}.log`,
  );

  try {
    await fs.writeFile(archivePath, content, {
      encoding: 'utf8',
      flag: 'wx',
    });

    return archivePath;
  } catch (error) {
    if (error.code === 'EEXIST') {
      return createArchiveFile(archiveDate, content, archiveNumber + 1);
    }

    throw error;
  }
};

const rotateErrorLog = async () => {
  const processingPath = path.join(
    LOGS_DIRECTORY,
    `errors.processing-${process.pid}-${Date.now()}.log`,
  );

  try {
    await fs.rename(ERROR_LOG_PATH, processingPath);

    return processingPath;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }

    throw error;
  }
};

const processRotatedLog = async (processingPath, archiveDate) => {
  const content = await fs.readFile(processingPath, 'utf8');
  const validRecords = [];
  const invalidLines = [];

  content.split(/\r?\n/).forEach(line => {
    if (line.trim() === '') {
      return;
    }

    try {
      const { message, code, time } = JSON.parse(line);

      validRecords.push(JSON.stringify({ message, code, time }));
    } catch (error) {
      invalidLines.push(line);
    }
  });

  if (invalidLines.length > 0) {
    const invalidLogPath = path.join(
      ARCHIVE_DIRECTORY,
      `errors-invalid-${archiveDate}.log`,
    );

    await fs.appendFile(
      invalidLogPath,
      `${invalidLines.join('\n')}\n`,
      'utf8',
    );
  }

  let archivePath = null;

  if (validRecords.length > 0) {
    archivePath = await createArchiveFile(
      archiveDate,
      `${validRecords.join('\n')}\n`,
    );
  }

  await fs.unlink(processingPath);

  return archivePath;
};

const archiveErrors = ({ archiveDate } = {}) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(archiveDate)) {
    return Promise.reject(new TypeError('Invalid archive date'));
  }

  archiveQueue = archiveQueue
    .then(async () => {
      await initializeLogger();

      const rotation = writeQueue.then(() => rotateErrorLog());

      writeQueue = rotation.catch(error => {
        console.error('Cannot rotate error log:', error);
      });

      const processingPath = await rotation;

      if (!processingPath) {
        return null;
      }

      return processRotatedLog(processingPath, archiveDate);
    })
    .catch(error => {
      console.error('Cannot archive error log:', error);

      return null;
    });

  return archiveQueue;
};

const hasArchiveForDate = async archiveDate => {
  await initializeLogger();

  const fileNames = await fs.readdir(ARCHIVE_DIRECTORY);
  const baseName = `errors-${archiveDate}`;

  return fileNames.some(fileName => {
    if (fileName === `${baseName}.log`) {
      return true;
    }

    if (!fileName.startsWith(`${baseName}-`) || !fileName.endsWith('.log')) {
      return false;
    }

    const suffix = fileName.slice(baseName.length, -4);

    return /^-\d+$/.test(suffix);
  });
};

module.exports = {
  initializeLogger,
  logError,
  archiveErrors,
  hasArchiveForDate,
};
