import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  clearPaymentStore,
  pay as submitPayment,
} from '../../store/slices/paymentSlice';
import PayForm from '../../components/PayForm/PayForm';
import styles from './Payment.module.sass';
import Error from '../../components/Error/Error';
import {
  getContestFile,
  clearContestFiles,
} from '../../utils/contestFilesStorage';

const Payment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isPromoCodeVisible, setIsPromoCodeVisible] = useState(false);

  const contests = useSelector(state => state.contestCreationStore.contests);
  const error = useSelector(state => state.payment.error);

  const hasContests = Object.keys(contests).length > 0;

  useEffect(() => {
    if (!hasContests) {
      navigate('/startContest', { replace: true });
    }
  }, [hasContests, navigate]);

  const clearError = () => {
    dispatch(clearPaymentStore());
  };

  const goBack = () => {
    navigate(-1);
  };

  const handlePayment = async values => {
    const formData = new FormData();

    const contestArray = Object.entries(contests).map(
      ([contestType, contest]) => {
        const file = getContestFile(contestType);
        const haveFile = file instanceof File;

        if (haveFile) {
          formData.append('files', file);
        }

        return {
          ...contest,
          haveFile,
        };
      }
    );

    formData.append('number', values.number);
    formData.append('expiry', values.expiry);
    formData.append('cvc', values.cvc);
    formData.append('contests', JSON.stringify(contestArray));
    formData.append('price', '100');

    const result = await dispatch(
      submitPayment({
        data: {
          formData,
        },
        navigate,
      })
    );

    if (submitPayment.fulfilled.match(result)) {
      clearContestFiles();
    }

    return result;
  };

  if (!hasContests) {
    return null;
  }

  return (
    <div className={styles.mainContainer}>
      <div className={styles.paymentContainer}>
        <span className={styles.headerLabel}>Checkout</span>
        {error && (
          <Error
            data={error.data}
            status={error.status}
            clearError={clearError}
          />
        )}
        <PayForm sendRequest={handlePayment} back={goBack} isPayForOrder />
      </div>
      <div className={styles.orderInfoContainer}>
        <span className={styles.orderHeader}>Order Summary</span>
        <div className={styles.packageInfoContainer}>
          <span className={styles.packageName}>Package Name: Standard</span>
          <span className={styles.packagePrice}>$100 USD</span>
        </div>
        <div className={styles.resultPriceContainer}>
          <span>Total:</span>
          <span>$100.00 USD</span>
        </div>
        <button
          type='button'
          className={styles.promoLink}
          aria-expanded={isPromoCodeVisible}
          aria-controls='promo-code-placeholder'
          onClick={() => setIsPromoCodeVisible(currentValue => !currentValue)}
        >
          Have a promo code?
        </button>

        {isPromoCodeVisible && (
          <p
            id='promo-code-placeholder'
            className={styles.promoPlaceholder}
            role='status'
          >
            Promo codes are not available yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default Payment;
