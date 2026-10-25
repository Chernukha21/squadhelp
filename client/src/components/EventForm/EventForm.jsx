import { ErrorMessage, Field, Form, Formik } from 'formik';
import Schemas from '../../utils/validators/validationSchemas';
import styles from './EventForm.module.sass';

const initialValues = {
  name: '',
  eventAt: '',
  notifyBeforeMinutes: 0,
};

const EventForm = ({ onSubmit }) => (
  <div className={styles.container}>
    <Formik
      initialValues={initialValues}
      validationSchema={Schemas.EventSchema}
      onSubmit={onSubmit}
    >
      {({ isSubmitting, errors, touched }) => (
        <Form className={styles.form} noValidate>
          <div className={styles.formHeader}>
            <h2>Create an event</h2>
            <p>Plan your next branding update.</p>
          </div>

          <div className={`${styles.field} ${styles.fullWidth}`}>
            <label htmlFor='event-name' className={styles.label}>
              Event name
            </label>

            <Field
              id='event-name'
              name='name'
              type='text'
              placeholder='e.g. New Year rebranding'
              maxLength={100}
              className={styles.input}
              aria-invalid={Boolean(touched.name && errors.name)}
              aria-describedby='event-name-error'
            />

            <ErrorMessage
              id='event-name-error'
              name='name'
              component='span'
              className={styles.error}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor='event-date' className={styles.label}>
              Date and time
            </label>

            <Field
              id='event-date'
              name='eventAt'
              type='datetime-local'
              className={styles.input}
              aria-invalid={Boolean(touched.eventAt && errors.eventAt)}
              aria-describedby='event-date-error'
            />

            <ErrorMessage
              id='event-date-error'
              name='eventAt'
              component='span'
              className={styles.error}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor='event-notification' className={styles.label}>
              Notify before (minutes)
            </label>

            <Field
              id='event-notification'
              name='notifyBeforeMinutes'
              type='number'
              min='0'
              step='1'
              className={styles.input}
              aria-invalid={Boolean(
                touched.notifyBeforeMinutes && errors.notifyBeforeMinutes
              )}
              aria-describedby='event-notification-error'
            />

            <ErrorMessage
              id='event-notification-error'
              name='notifyBeforeMinutes'
              component='span'
              className={styles.error}
            />
          </div>

          <div className={styles.actions}>
            <p className={styles.hint}>
              Set 0 to be notified when the event starts.
            </p>

            <button
              type='submit'
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              Add event
            </button>
          </div>
        </Form>
      )}
    </Formik>
  </div>
);

export default EventForm;
