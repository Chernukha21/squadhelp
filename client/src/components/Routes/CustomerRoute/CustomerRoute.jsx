import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import CONSTANTS from '../../../constants';

const CustomerRoute = () => {
  const role = useSelector(state => state.userStore.data?.role);

  return role === CONSTANTS.CUSTOMER ? (
    <Outlet />
  ) : (
    <Navigate to='/dashboard' replace />
  );
};

export default CustomerRoute;
