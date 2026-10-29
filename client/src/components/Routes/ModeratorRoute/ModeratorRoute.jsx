import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import CONSTANTS from '../../../constants';

const ModeratorRoute = () => {
  const role = useSelector(state => state.userStore.data?.role);

  if (role !== CONSTANTS.MODERATOR) {
    return <Navigate to='/' replace />;
  }

  return <Outlet />;
};

export default ModeratorRoute;
