import CONSTANTS from '../../constants';
import styles from './ModeratorOfferRow.module.sass';

const capitalize = value => {
  if (!value) {
    return 'Unknown';
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
};

const ModeratorOfferRow = ({ offer, isUpdating, isActive, onDecision }) => {
  const isPending =
    offer.moderationStatus === CONSTANTS.OFFER_MODERATION_STATUS_PENDING;

  const imagePath = offer.fileName
    ? `${CONSTANTS.publicURL}${offer.fileName}`
    : null;

  const moderationClassName = [
    styles.statusBadge,
    styles[offer.moderationStatus],
  ]
    .filter(Boolean)
    .join(' ');

  const contestStatusClassName = [styles.statusBadge, styles[offer.status]]
    .filter(Boolean)
    .join(' ');

  return (
    <tr className={styles.row}>
      <td data-label='Offer ID' className={styles.idCell}>
        #{offer.id}
      </td>

      <td data-label='Contest ID' className={styles.idCell}>
        #{offer.contestId}
      </td>

      <td data-label='Offer' className={styles.offerCell}>
        {offer.text ? (
          <p className={styles.offerText}>{offer.text}</p>
        ) : imagePath ? (
          <a
            href={imagePath}
            className={styles.imageLink}
            target='_blank'
            rel='noreferrer'
          >
            <img
              src={`${CONSTANTS.publicURL}${offer.fileName}`}
              className={styles.offerImage}
              alt={offer.originalFileName || 'Logo offer'}
              loading='lazy'
            />
          </a>
        ) : (
          <span className={styles.noContent}>No content</span>
        )}
      </td>

      <td data-label='Contest status'>
        <span className={contestStatusClassName}>
          {capitalize(offer.status)}
        </span>
      </td>

      <td data-label='Moderation'>
        <span className={moderationClassName}>
          {capitalize(offer.moderationStatus)}
        </span>
      </td>

      <td data-label='Actions'>
        {isPending ? (
          <div className={styles.actions}>
            <button
              type='button'
              className={`${styles.actionButton} ${styles.approveButton}`}
              disabled={isUpdating}
              onClick={() =>
                onDecision(offer.id, CONSTANTS.OFFER_MODERATION_STATUS_APPROVED)
              }
            >
              {isUpdating && isActive ? 'Processing...' : 'Approve'}
            </button>

            <button
              type='button'
              className={`${styles.actionButton} ${styles.rejectButton}`}
              disabled={isUpdating}
              onClick={() =>
                onDecision(offer.id, CONSTANTS.OFFER_MODERATION_STATUS_REJECTED)
              }
            >
              Reject
            </button>
          </div>
        ) : (
          <span className={styles.processed}>-</span>
        )}
      </td>
    </tr>
  );
};

export default ModeratorOfferRow;
