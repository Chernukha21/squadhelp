import { Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import { ToastContainer } from 'react-toastify';
import { useSelector } from 'react-redux';
import Router from './router';
import LoginPage from './pages/LoginPage/LoginPage';
import RegistrationPage from './pages/RegistrationPage/RegistrationPage';
import Payment from './pages/Payment/Payment';
import StartContestPage from './pages/StartContestPage/StartContestPage';
import Dashboard from './pages/Dashboard/Dashboard';
import NotFound from './components/NotFound/NotFound';
import Home from './pages/Home/Home';
import ContestPage from './pages/ContestPage/ContestPage';
import UserProfile from './pages/UserProfile/UserProfile';
import 'react-toastify/dist/ReactToastify.css';
import ContestCreationPage from './pages/ContestCreation/ContestCreationPage';
import CONSTANTS from './constants';
import browserHistory from './browserHistory';
import ChatContainer from './components/Chat/ChatComponents/ChatContainer/ChatContainer';
import Layout from './pages/Layout/Layout';
import OnlyNotAuthorizedUserRoute from './components/Routes/OnlyNotAuthorizedUserRoute/OnlyNotAuthorizedUserRoute';
import PrivateRoute from './components/Routes/PrivateRoute/PrivateRoute';
import HowItWorks from './pages/HowItWorks/HowItWorks';
import Events from './pages/Events/Events';
import ModeratorRoute from './components/Routes/ModeratorRoute/ModeratorRoute';
import ModeratorOffersPage from './pages/ModeratorOffers/ModeratorOffersPage';
import RegularUserRoute from './components/Routes/RegularUserRoute/RegularUserRoute';

const App = () => {
  const role = useSelector(state => state.userStore.data?.role);

  const canUseChat = [CONSTANTS.CUSTOMER, CONSTANTS.CREATOR].includes(role);
  return (
    <Router history={browserHistory}>
      <ToastContainer
        position='top-center'
        autoClose={5000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnVisibilityChange
        draggable
        pauseOnHover
      />
      <Routes>
        <Route element={<PrivateRoute />}>
          <Route element={<ModeratorRoute />}>
            <Route path='/moderator/offers' element={<ModeratorOffersPage />} />
          </Route>
        </Route>
        <Route path='/' element={<Layout />}>
          <Route
            index
            element={
              role === CONSTANTS.MODERATOR ? (
                <Navigate to='/moderator/offers' replace />
              ) : (
                <Home />
              )
            }
          />
          <Route path='/how-it-works' element={<HowItWorks />} />
          <Route element={<OnlyNotAuthorizedUserRoute />}>
            <Route path='/login' element={<LoginPage />} />
            <Route path='/registration' element={<RegistrationPage />} />
          </Route>

          <Route element={<PrivateRoute />}>
            <Route element={<RegularUserRoute />}>
              <Route path='events' element={<Events />} />
              <Route path='/payment' element={<Payment />} />
              <Route path='/startContest' element={<StartContestPage />} />
              <Route
                path='/startContest/nameContest'
                element={
                  <ContestCreationPage
                    contestType={CONSTANTS.NAME_CONTEST}
                    title='Company Name'
                  />
                }
              />
              <Route
                path='/startContest/taglineContest'
                element={
                  <ContestCreationPage
                    contestType={CONSTANTS.TAGLINE_CONTEST}
                    title='TAGLINE'
                  />
                }
              />
              <Route
                path='/startContest/logoContest'
                element={
                  <ContestCreationPage
                    contestType={CONSTANTS.LOGO_CONTEST}
                    title='LOGO'
                  />
                }
              />
              <Route path='/dashboard' element={<Dashboard />} />
              <Route path='/contest/:id' element={<ContestPage />} />
              <Route path='/account' element={<UserProfile />} />
            </Route>
          </Route>
          <Route path='*' element={<NotFound />} />
        </Route>
      </Routes>
      {canUseChat && <ChatContainer />}
    </Router>
  );
};
export default App;
