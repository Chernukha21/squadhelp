import { useSelector } from 'react-redux';
import moment from 'moment';
import { selectEvents } from '../../store/slices/eventsSlice';
import useNow from '../../hooks/useNow';
import styles from './EventsBadge.module.sass';

const EventsBadge = () => {
  const events = useSelector(selectEvents);
  const now = useNow();

  const notificationCount = events.filter(event => {
    const notificationTime = moment(event.eventAt)
      .subtract(event.notifyBeforeMinutes, 'minutes')
      .valueOf();

    return now >= notificationTime;
  }).length;

  if (notificationCount === 0) {
    return null;
  }

  return (
    <span className={styles.badge} title='Events requiring your attention'>
      {notificationCount}
    </span>
  );
};

export default EventsBadge;
