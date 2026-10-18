import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { getUser } from '../../../store/slices/userSlice';
import Spinner from '../../Spinner/Spinner';
import CONSTANTS from '../../../constants';

const OnlyNotAuthorizedUserRoute = () => {
  const dispatch = useDispatch();

  const { data, isFetching } = useSelector(state => state.userStore);

  const accessToken = localStorage.getItem(CONSTANTS.ACCESS_TOKEN);

  useEffect(() => {
    if (accessToken && !data) {
      dispatch(getUser());
    }
  }, [accessToken, data, dispatch]);

  if (!accessToken) {
    return <Outlet />;
  }

  if (isFetching) {
    return <Spinner />;
  }

  return data ? <Navigate to='/' replace /> : <Outlet />;
};

export default OnlyNotAuthorizedUserRoute;
