import moment from 'moment';
import classNames from 'classnames';
import styles from './EventCard.module.sass';

const formatRemainingTime = seconds => {
  const duration = moment.duration(seconds, 'seconds');
  const days = Math.floor(duration.asDays());

  const time = [duration.hours(), duration.minutes(), duration.seconds()]
    .map(value => String(value).padStart(2, '0'))
    .join(':');

  return days > 0 ? `${days}d ${time}` : time;
};

const EventCard = ({ event, now, onRemove }) => {
  const eventTime = moment(event.eventAt).valueOf();
  const createdTime = moment(event.createdAt).valueOf();

  const remainingSeconds = Math.max(0, Math.ceil((eventTime - now) / 1000));

  const notificationTime = eventTime - event.notifyBeforeMinutes * 60 * 1000;

  const isFinished = remainingSeconds === 0;
  const isNotificationDue = now >= notificationTime;

  const totalDuration = Math.max(1, eventTime - createdTime);

  const progress = Math.min(
    100,
    Math.max(0, ((now - createdTime) / totalDuration) * 100)
  );

  return (
    <li
      className={classNames(styles.card, {
        [styles.notificationDue]: isNotificationDue,
        [styles.finished]: isFinished,
      })}
    >
      <div
        className={styles.progress}
        style={{ width: `${progress}%` }}
        aria-hidden='true'
      />

      <div className={styles.content}>
        <div className={styles.info}>
          <h3>{event.name}</h3>

          <time dateTime={event.eventAt}>
            {moment(event.eventAt).format('DD.MM.YYYY HH:mm')}
          </time>
        </div>

        <span className={styles.countdown} role='timer'>
          {isFinished ? 'Event started' : formatRemainingTime(remainingSeconds)}
        </span>

        <button
          type='button'
          className={styles.deleteButton}
          onClick={() => onRemove(event.id)}
          aria-label={`Delete event: ${event.name}`}
        >
          ×
        </button>
      </div>
    </li>
  );
};

export default EventCard;
