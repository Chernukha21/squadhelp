import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import {
  clearContestsList,
  getContests,
  setNewCustomerFilter,
} from '../../store/slices/contestsSlice';
import CONSTANTS from '../../constants';
import ContestsContainer from '../ContestsContainer/ContestsContainer';
import TryAgain from '../TryAgain/TryAgain';
import ContestBox from '../ContestBox/ContestBox';
import styles from './CustomerDashboard.module.sass';

const filters = [
  {
    status: CONSTANTS.CONTEST_STATUS_ACTIVE,
    label: 'Active contests',
  },
  {
    status: CONSTANTS.CONTEST_STATUS_FINISHED,
    label: 'Completed contests',
  },
  {
    status: CONSTANTS.CONTEST_STATUS_PENDING,
    label: 'Inactive contests',
  },
];

const CustomerDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { contests, customerFilter, error, haveMore, isFetching } = useSelector(
    state => state.contestsList
  );

  const loadFirstPage = useCallback(
    () =>
      dispatch(
        getContests({
          requestData: {
            limit: 8,
            offset: 0,
            contestStatus: customerFilter,
          },
          role: CONSTANTS.CUSTOMER,
        })
      ),
    [dispatch, customerFilter]
  );

  const loadMore = useCallback(
    offset =>
      dispatch(
        getContests({
          requestData: {
            limit: 8,
            offset,
            contestStatus: customerFilter,
          },
          role: CONSTANTS.CUSTOMER,
        })
      ),
    [dispatch, customerFilter]
  );

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  useEffect(
    () => () => {
      dispatch(clearContestsList());
    },
    [dispatch]
  );

  const handleFilterChange = filter => {
    if (filter !== customerFilter) {
      dispatch(setNewCustomerFilter(filter));
    }
  };

  const handleRetry = () => {
    dispatch(clearContestsList());
    return loadFirstPage();
  };

  const goToExtended = contestId => {
    navigate(`/contest/${contestId}`);
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.filterContainer} aria-label='Contest status'>
        {filters.map(({ status, label }) => (
          <button
            key={status}
            type='button'
            className={
              status === customerFilter ? styles.activeFilter : styles.filter
            }
            aria-pressed={status === customerFilter}
            onClick={() => handleFilterChange(status)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={styles.contestsContainer}>
        {error ? (
          <TryAgain getData={handleRetry} />
        ) : (
          <ContestsContainer
            isFetching={isFetching}
            loadMore={loadMore}
            haveMore={haveMore}
          >
            {contests.map(contest => (
              <ContestBox
                key={contest.id}
                data={contest}
                goToExtended={goToExtended}
              />
            ))}
          </ContestsContainer>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
