import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import Spinner from '../../Spinner/Spinner';
import CONSTANTS from '../../../constants';

const PrivateRoute = () => {
  const { data, isFetching, isAuthChecked } = useSelector(
    state => state.userStore
  );

  const token = localStorage.getItem(CONSTANTS.ACCESS_TOKEN);

  if (!token) {
    return <Navigate to='/login' replace />;
  }

  if (isFetching || !isAuthChecked) {
    return <Spinner />;
  }

  return data ? <Outlet /> : <Navigate to='/login' replace />;
};

export default PrivateRoute;
