import { useEffect, useState } from 'react';
import moment from 'moment';

const useNow = () => {
  const [now, setNow] = useState(() => moment().valueOf());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(moment().valueOf());
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return now;
};

export default useNow;
