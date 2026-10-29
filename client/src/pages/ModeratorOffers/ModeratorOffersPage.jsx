import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ModeratorOfferRow from '../../components/ModeratorOfferRow/ModeratorOfferRow';
import Spinner from '../../components/Spinner/Spinner';
import Error from '../../components/Error/Error';
import {
  clearModeratorOffersError,
  getModeratorOffers,
  moderateOffer,
} from '../../store/slices/moderatorOffersSlice';
import { clearUserStore } from '../../store/slices/userSlice';
import CONSTANTS from '../../constants';
import styles from './ModeratorOffersPage.module.sass';

const PAGE_LIMIT = 10;

const ModeratorOffersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [moderationStatus, setModerationStatus] = useState(
    CONSTANTS.OFFER_MODERATION_STATUS_PENDING
  );

  const { offers, pagination, isFetching, isUpdating, activeOfferId, error } =
    useSelector(state => state.moderatorOffersStore);

  const loadOffers = useCallback(
    () =>
      dispatch(
        getModeratorOffers({
          page,
          limit: PAGE_LIMIT,
          moderationStatus: moderationStatus || undefined,
        })
      ),
    [dispatch, moderationStatus, page]
  );

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  const handleStatusChange = event => {
    setModerationStatus(event.target.value);
    setPage(1);
  };

  const handleDecision = async (offerId, decision) => {
    const result = await dispatch(
      moderateOffer({
        offerId,
        decision,
      })
    );

    if (moderateOffer.fulfilled.match(result)) {
      if (offers.length === 1 && page > 1) {
        setPage(currentPage => currentPage - 1);
      } else {
        loadOffers();
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(CONSTANTS.ACCESS_TOKEN);
    dispatch(clearUserStore());
    navigate('/login', { replace: true });
  };

  const clearError = () => {
    dispatch(clearModeratorOffersError());
  };

  const totalPages = Math.max(pagination.totalPages, 1);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <span className={styles.eyebrow}>Moderator workspace</span>

          <h1>Offer moderation</h1>

          <p>
            Review submitted offers before they become visible to customers.
          </p>
        </div>

        <button
          type='button'
          className={styles.logoutButton}
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      <section className={styles.toolbar}>
        <div className={styles.filterGroup}>
          <label htmlFor='moderationStatus'>Moderation status</label>

          <select
            id='moderationStatus'
            className={styles.select}
            value={moderationStatus}
            onChange={handleStatusChange}
          >
            <option value=''>All offers</option>

            <option value={CONSTANTS.OFFER_MODERATION_STATUS_PENDING}>
              Pending
            </option>

            <option value={CONSTANTS.OFFER_MODERATION_STATUS_APPROVED}>
              Approved
            </option>

            <option value={CONSTANTS.OFFER_MODERATION_STATUS_REJECTED}>
              Rejected
            </option>
          </select>
        </div>

        <span className={styles.counter}>
          Total offers: {pagination.totalItems || 0}
        </span>
      </section>

      {error && (
        <div className={styles.errorContainer}>
          <Error
            data={error.data}
            status={error.status}
            clearError={clearError}
          />
        </div>
      )}

      {isFetching && offers.length === 0 ? (
        <div className={styles.loadingState}>
          <Spinner />
        </div>
      ) : (
        <section className={styles.content} aria-busy={isFetching}>
          {offers.length === 0 ? (
            !error && (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>✓</span>
                <h2>No offers found</h2>
                <p>There are no offers with the selected moderation status.</p>
              </div>
            )
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope='col'>Offer ID</th>
                    <th scope='col'>Contest ID</th>
                    <th scope='col'>Offer</th>
                    <th scope='col'>Contest status</th>
                    <th scope='col'>Moderation</th>
                    <th scope='col'>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {offers.map(offer => (
                    <ModeratorOfferRow
                      key={offer.id}
                      offer={offer}
                      isUpdating={isUpdating}
                      isActive={activeOfferId === offer.id}
                      onDecision={handleDecision}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {offers.length > 0 && (
            <nav className={styles.pagination} aria-label='Offers pagination'>
              <button
                type='button'
                className={styles.pageButton}
                disabled={page <= 1 || isFetching || isUpdating}
                onClick={() =>
                  setPage(currentPage => Math.max(currentPage - 1, 1))
                }
              >
                Previous
              </button>

              <span className={styles.pageInfo}>
                Page <strong>{pagination.page || page}</strong> of{' '}
                <strong>{totalPages}</strong>
              </span>

              <button
                type='button'
                className={styles.pageButton}
                disabled={
                  pagination.totalPages === 0 ||
                  page >= pagination.totalPages ||
                  isFetching ||
                  isUpdating
                }
                onClick={() => setPage(currentPage => currentPage + 1)}
              >
                Next
              </button>
            </nav>
          )}
        </section>
      )}
    </main>
  );
};

export default ModeratorOffersPage;
