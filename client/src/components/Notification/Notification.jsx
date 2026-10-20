import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import styles from './Notification.module.sass';

const Notification = ({ message, contestId }) => (
  <div>
    <span>{message}</span>

    {contestId != null && (
      <Link
        to={`/contest/${contestId}`}
        className={styles.goToContest}
        onClick={() => toast.dismiss()}
      >
        <br />
        <span>Go to contest</span>
      </Link>
    )}
  </div>
);

export default Notification;
