import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import Spinner from '../../Spinner/Spinner';
import CONSTANTS from '../../../constants';
import { getUser } from '../../../store/slices/userSlice';

const PrivateRoute = () => {
  const dispatch = useDispatch();

  const { data, isFetching, isAuthChecked } = useSelector(
    state => state.userStore
  );

  const token = localStorage.getItem(CONSTANTS.ACCESS_TOKEN);

  useEffect(() => {
    if (token && !data && !isFetching && !isAuthChecked) {
      dispatch(getUser());
    }
  }, [token, data, isFetching, isAuthChecked, dispatch]);

  if (!token) {
    return <Navigate to='/login' replace />;
  }

  if (isFetching || !isAuthChecked) {
    return <Spinner />;
  }

  return data ? <Outlet /> : <Navigate to='/login' replace />;
};

export default PrivateRoute;
