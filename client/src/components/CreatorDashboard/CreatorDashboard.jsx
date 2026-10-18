import { useCallback, useEffect, useMemo } from 'react';
import queryString from 'query-string';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  clearContestsList,
  getContests,
  setNewCreatorFilter,
} from '../../store/slices/contestsSlice';
import { getDataForContest } from '../../store/slices/dataForContestSlice';
import ContestsContainer from '../ContestsContainer/ContestsContainer';
import styles from './CreatorDashboard.module.sass';
import TryAgain from '../TryAgain/TryAgain';
import CONSTANTS from '../../constants';
import ContestBox from '../ContestBox/ContestBox';

const types = [
  '',
  'name,tagline,logo',
  'name',
  'tagline',
  'logo',
  'name,tagline',
  'logo,tagline',
  'name,logo',
];

const CreatorDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { contests, error, haveMore, isFetching } = useSelector(
    state => state.contestsList
  );
  const dataForContest = useSelector(state => state.dataForContest);

  const creatorFilter = useMemo(() => {
    const params = queryString.parse(location.search);
    const typeIndex = Number(params.typeIndex);

    return {
      typeIndex:
        Number.isInteger(typeIndex) &&
        typeIndex >= 1 &&
        typeIndex < types.length
          ? typeIndex
          : 1,
      contestId: params.contestId || '',
      industry: params.industry || '',
      awardSort: params.awardSort === 'desc' ? 'desc' : 'asc',
      ownEntries: params.ownEntries === 'true',
    };
  }, [location.search]);

  const loadContests = useCallback(
    (offset = 0) => {
      return dispatch(
        getContests({
          requestData: {
            limit: 8,
            offset,
            ...creatorFilter,
          },
          role: CONSTANTS.CREATOR,
        })
      );
    },
    [dispatch, creatorFilter]
  );

  useEffect(() => {
    dispatch(setNewCreatorFilter(creatorFilter));
    loadContests();
  }, [dispatch, creatorFilter, loadContests]);

  useEffect(() => {
    dispatch(getDataForContest());

    return () => {
      dispatch(clearContestsList());
    };
  }, [dispatch]);

  const changePredicate = ({ name, value }) => {
    if (creatorFilter[name] === value) {
      return;
    }

    const nextFilter = {
      ...creatorFilter,
      [name]: value,
    };

    const params = Object.fromEntries(
      Object.entries(nextFilter).filter(([, fieldValue]) => fieldValue)
    );

    const search = queryString.stringify(params);

    navigate(`${location.pathname}${search ? `?${search}` : ''}`);
  };

  const tryLoadAgain = () => {
    dispatch(clearContestsList());
    return loadContests();
  };

  const goToExtended = contestId => {
    navigate(`/contest/${contestId}`);
  };

  const renderSelectType = () => {
    const array = [];
    types.forEach(
      (el, i) =>
        !i ||
        array.push(
          <option key={i - 1} value={el}>
            {el}
          </option>
        )
    );
    return (
      <select
        onChange={({ target }) =>
          changePredicate({
            name: 'typeIndex',
            value: types.indexOf(target.value),
          })
        }
        value={types[creatorFilter.typeIndex]}
        className={styles.input}
      >
        {array}
      </select>
    );
  };

  const renderIndustryType = () => {
    const industry = dataForContest.data?.industry ?? [];

    return (
      <select
        onChange={({ target }) =>
          changePredicate({
            name: 'industry',
            value: target.value,
          })
        }
        value={creatorFilter.industry}
        className={styles.input}
      >
        <option value=''>Choose industry</option>

        {industry.map(item => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    );
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.filterContainer}>
        <span className={styles.headerFilter}>Filter Results</span>
        <div className={styles.inputsContainer}>
          <div
            onClick={() =>
              changePredicate({
                name: 'ownEntries',
                value: !creatorFilter.ownEntries,
              })
            }
            className={classNames(styles.myEntries, {
              [styles.activeMyEntries]: creatorFilter.ownEntries,
            })}
          >
            My Entries
          </div>
          <div className={styles.inputContainer}>
            <span>By contest type</span>
            {renderSelectType()}
          </div>
          <div className={styles.inputContainer}>
            <span>By contest ID</span>
            <input
              type='text'
              onChange={({ target }) =>
                changePredicate({
                  name: 'contestId',
                  value: target.value,
                })
              }
              name='contestId'
              value={creatorFilter.contestId}
              className={styles.input}
            />
          </div>
          {!dataForContest.isFetching && (
            <div className={styles.inputContainer}>
              <span>By industry</span>
              {renderIndustryType()}
            </div>
          )}
          <div className={styles.inputContainer}>
            <span>By amount award</span>
            <select
              onChange={({ target }) =>
                changePredicate({
                  name: 'awardSort',
                  value: target.value,
                })
              }
              value={creatorFilter.awardSort}
              className={styles.input}
            >
              <option value='desc'>Descending</option>
              <option value='asc'>Ascending</option>
            </select>
          </div>
        </div>
      </div>
      {error ? (
        <div className={styles.messageContainer}>
          <TryAgain getData={tryLoadAgain} />
        </div>
      ) : (
        <ContestsContainer
          isFetching={isFetching}
          loadMore={loadContests}
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
  );
};

export default CreatorDashboard;
