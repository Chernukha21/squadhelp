const { archiveErrors } = require('./errorLogger');

const CHECK_INTERVAL_MS = 10 * 1000;

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

  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });

  let lastArchiveDate = null;

  const checkTime = async () => {
    const parts = Object.fromEntries(
      formatter
        .formatToParts(new Date())
        .map(({ type, value }) => [type, value])
    );

    const currentDate = [
      parts.year,
      parts.month,
      parts.day,
    ].join('-');

    if (
      Number(parts.hour) !== hour ||
      Number(parts.minute) !== minute ||
      lastArchiveDate === currentDate
    ) {
      return;
    }

    lastArchiveDate = currentDate;

    try {
      const archivePath = await archiveErrors();

      if (archivePath) {
        console.log('Error log archived:', archivePath);
      }
    } catch (error) {
      console.error('Log archive job failed:', error);
    }
  };

  const timer = setInterval(checkTime, CHECK_INTERVAL_MS);

  timer.unref();
  checkTime();

  return () => clearInterval(timer);
};

module.exports = { startLogArchiving };
