import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import styles from './UserProfile.module.sass';
import CONSTANTS from '../../constants';
import UserInfo from '../../components/UserInfo/UserInfo';
import PayForm from '../../components/PayForm/PayForm';
import Error from '../../components/Error/Error';
import { cashOut, clearPaymentStore } from '../../store/slices/paymentSlice';
import { changeProfileViewMode } from '../../store/slices/userProfileSlice';

const UserProfile = () => {
  const dispatch = useDispatch();

  const { balance, role } = useSelector(state => state.userStore.data);
  const profileViewMode = useSelector(
    state => state.userProfile.profileViewMode
  );
  const error = useSelector(state => state.payment.error);

  const handleCashOut = values => {
    const { number, expiry, cvc, sum } = values;

    dispatch(
      cashOut({
        number,
        expiry,
        cvc,
        sum,
      })
    );
  };

  const handleModeChange = mode => {
    dispatch(changeProfileViewMode(mode));
  };

  const handleClearPayment = () => {
    dispatch(clearPaymentStore());
  };

  return (
    <div>
      <div className={styles.mainContainer}>
        <div className={styles.aside}>
          <span className={styles.headerAside}>Select Option</span>
          <div className={styles.optionsContainer}>
            <button
              type='button'
              className={classNames(styles.optionContainer, {
                [styles.currentOption]:
                  profileViewMode === CONSTANTS.USER_INFO_MODE,
              })}
              onClick={() => handleModeChange(CONSTANTS.USER_INFO_MODE)}
            >
              UserInfo
            </button>
            {role === CONSTANTS.CREATOR && (
              <button
                type='button'
                className={classNames(styles.optionContainer, {
                  [styles.currentOption]:
                    profileViewMode === CONSTANTS.CASHOUT_MODE,
                })}
                onClick={() => handleModeChange(CONSTANTS.CASHOUT_MODE)}
              >
                Cashout
              </button>
            )}
          </div>
        </div>
        {profileViewMode === CONSTANTS.USER_INFO_MODE ? (
          <UserInfo />
        ) : (
          <div className={styles.container}>
            {Number(balance) === 0 ? (
              <span className={styles.notMoney}>
                There is no money on your balance
              </span>
            ) : (
              <div>
                {error && (
                  <Error
                    data={error.data}
                    status={error.status}
                    clearError={handleClearPayment}
                  />
                )}
                <PayForm sendRequest={handleCashOut} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
