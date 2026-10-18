import classNames from 'classnames';
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
import styles from './CustomerDashboard.module.sass';
import TryAgain from '../TryAgain/TryAgain';
import ContestBox from '../ContestBox/ContestBox.jsx';

const CustomerDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { contests, customerFilter, error, haveMore, isFetching } = useSelector(
    state => state.contestsList
  );

  const loadFirstPage = useCallback(() => {
    return dispatch(
      getContests({
        requestData: {
          limit: 8,
          offset: 0,
          contestStatus: customerFilter,
        },
        role: CONSTANTS.CUSTOMER,
      })
    );
  }, [dispatch, customerFilter]);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  useEffect(() => {
    return () => {
      dispatch(clearContestsList());
    };
  }, [dispatch]);

  const loadMore = useCallback(
    offset => {
      return dispatch(
        getContests({
          requestData: {
            limit: 8,
            offset,
            contestStatus: customerFilter,
          },
          role: CONSTANTS.CUSTOMER,
        })
      );
    },
    [dispatch, customerFilter]
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
      <div className={styles.filterContainer}>
        <div
          onClick={() => handleFilterChange(CONSTANTS.CONTEST_STATUS_ACTIVE)}
          className={classNames({
            [styles.activeFilter]:
              CONSTANTS.CONTEST_STATUS_ACTIVE === customerFilter,
            [styles.filter]: CONSTANTS.CONTEST_STATUS_ACTIVE !== customerFilter,
          })}
        >
          Active Contests
        </div>
        <div
          onClick={() => handleFilterChange(CONSTANTS.CONTEST_STATUS_FINISHED)}
          className={classNames({
            [styles.activeFilter]:
              CONSTANTS.CONTEST_STATUS_FINISHED === customerFilter,
            [styles.filter]:
              CONSTANTS.CONTEST_STATUS_FINISHED !== customerFilter,
          })}
        >
          Completed contests
        </div>
        <div
          onClick={() => handleFilterChange(CONSTANTS.CONTEST_STATUS_PENDING)}
          className={classNames({
            [styles.activeFilter]:
              CONSTANTS.CONTEST_STATUS_PENDING === customerFilter,
            [styles.filter]:
              CONSTANTS.CONTEST_STATUS_PENDING !== customerFilter,
          })}
        >
          Inactive contests
        </div>
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
