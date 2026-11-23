const cron = require('node-cron');
const {
  archiveErrors,
  hasArchiveForDate,
} = require('./errorLogger');

const getDateInTimeZone = (date, timeZone) => {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .map(({ type, value }) => [type, value]),
  );

  return [parts.year, parts.month, parts.day].join('-');
};

const startLogArchiving = ({
                             hour = 0,
                             minute = 0,
                             timeZone = 'Europe/Kyiv',
                           } = {}) => {
  if (
    !Number.isInteger(hour) ||
    hour < 0 ||
    hour > 23 ||
    !Number.isInteger(minute) ||
    minute < 0 ||
    minute > 59
  ) {
    throw new RangeError('Invalid archive time');
  }

  getDateInTimeZone(new Date(), timeZone);

  const cronExpression = `${minute} ${hour} * * *`;

  if (!cron.validate(cronExpression)) {
    throw new RangeError('Invalid archive schedule');
  }

  let activeJob = null;

  const runArchiveJob = () => {
    if (activeJob) {
      return activeJob;
    }

    activeJob = (async () => {
      const archiveDate = getDateInTimeZone(new Date(), timeZone);

      if (await hasArchiveForDate(archiveDate)) {
        return null;
      }

      const archivePath = await archiveErrors({ archiveDate });

      if (archivePath) {
        console.log('Error log archived:', archivePath);
      }

      return archivePath;
    })()
      .catch(error => {
        console.error('Log archive job failed:', error);

        return null;
      })
      .finally(() => {
        activeJob = null;
      });

    return activeJob;
  };

  const task = cron.schedule(cronExpression, runArchiveJob, {
    timezone: timeZone,
  });

  runArchiveJob();

  return () => task.stop();
};

module.exports = { startLogArchiving };
