import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import CONSTANTS from '../../../constants';

const RegularUserRoute = () => {
  const role = useSelector(state => state.userStore.data?.role);

  const isRegularUser = [CONSTANTS.CUSTOMER, CONSTANTS.CREATOR].includes(role);

  if (!isRegularUser) {
    return <Navigate to='/moderator/offers' replace />;
  }

  return <Outlet />;
};

export default RegularUserRoute;
