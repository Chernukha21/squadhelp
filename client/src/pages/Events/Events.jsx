import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import EventForm from '../../components/EventForm/EventForm';
import {
  addEvent,
  removeEvent,
  selectSortedEvents,
} from '../../store/slices/eventsSlice';
import EventCard from '../../components/EventCard/EventCard';
import useNow from '../../hooks/useNow';
import styles from './Events.module.sass';

const Events = () => {
  const userId = useSelector(state => state.userStore.data?.id);
  const dispatch = useDispatch();
  const events = useSelector(selectSortedEvents);
  const now = useNow();

  const handleSubmit = (values, { resetForm, setSubmitting }) => {
    if (userId === undefined) {
      setSubmitting(false);
      return;
    }

    dispatch(
      addEvent({
        userId,
        name: values.name.trim(),
        eventAt: moment(values.eventAt, 'YYYY-MM-DDTHH:mm', true).toISOString(),
        notifyBeforeMinutes: Number(values.notifyBeforeMinutes),
      })
    );

    resetForm();
    setSubmitting(false);
  };

  const handleRemoveEvent = event => {
    if (userId === undefined) {
      return;
    }

    confirmAlert({
      title: 'Delete event?',
      message: `Are you sure you want to delete “${event.name}”?`,
      buttons: [
        {
          label: 'Delete',
          onClick: () => {
            dispatch(
              removeEvent({
                eventId: event.id,
                userId,
              })
            );
          },
        },
        {
          label: 'Cancel',
        },
      ],
    });
  };

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Events</h1>

      <p className={styles.description}>Plan your next branding update.</p>

      <EventForm onSubmit={handleSubmit} />
      <section className={styles.eventsSection}>
        <header className={styles.listHeader}>
          <h2 className={styles.listTitle}>Upcoming events</h2>

          <span className={styles.remainingLabel}>
            <span>Remaining time</span>
            <svg
              className={styles.clockIcon}
              width='40'
              height='40'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='1.8'
              strokeLinecap='round'
              strokeLinejoin='round'
              aria-hidden='true'
              focusable='false'
            >
              <circle cx='12' cy='12' r='9' />
              <path d='M12 7v5l3 2' />
            </svg>
          </span>
        </header>

        {events.length === 0 ? (
          <p className={styles.emptyState}>No events yet.</p>
        ) : (
          <ul className={styles.eventsList}>
            {events.map(event => (
              <EventCard
                key={event.id}
                event={event}
                now={now}
                onRemove={handleRemoveEvent}
              />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};

export default Events;
