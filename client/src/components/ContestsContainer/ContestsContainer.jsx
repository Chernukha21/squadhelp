import { Children, useEffect } from 'react';
import styles from './ContestContainer.module.sass';
import Spinner from '../Spinner/Spinner';

const ContestsContainer = ({ children, isFetching, haveMore, loadMore }) => {
  const contestCount = Children.count(children);

  useEffect(() => {
    const handleScroll = () => {
      if (isFetching || !haveMore) {
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } =
        document.documentElement;

      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 10;

      if (isNearBottom) {
        loadMore(contestCount);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [contestCount, isFetching, haveMore, loadMore]);

  if (!isFetching && contestCount === 0) {
    return <div className={styles.notFound}>Nothing found</div>;
  }

  return (
    <div>
      {children}

      {isFetching && (
        <div className={styles.spinnerContainer}>
          <Spinner />
        </div>
      )}
    </div>
  );
};

export default ContestsContainer;
