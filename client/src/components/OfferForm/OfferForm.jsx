import { useDispatch, useSelector } from 'react-redux';
import { Form, Formik } from 'formik';
import CONSTANTS from '../../constants';
import {
  addOffer,
  clearAddOfferError,
} from '../../store/slices/contestByIdSlice';
import styles from './OfferForm.module.sass';
import FormInput from '../FormInput/FormInput';
import Schemas from '../../utils/validators/validationSchemas';
import Error from '../Error/Error';
import ImageUpload from '../InputComponents/ImageUpload/ImageUpload';

const OfferForm = ({ contestType, contestId, customerId }) => {
  const dispatch = useDispatch();

  const addOfferError = useSelector(
    state => state.contestByIdStore.addOfferError
  );

  const handleClearError = () => {
    dispatch(clearAddOfferError());
  };

  const setOffer = async (values, { resetForm }) => {
    dispatch(clearAddOfferError());

    const data = new FormData();

    data.append('contestId', contestId);
    data.append('contestType', contestType);
    data.append('offerData', values.offerData);
    data.append('customerId', customerId);

    const result = await dispatch(addOffer(data));

    if (addOffer.fulfilled.match(result)) {
      resetForm();
    }
  };

  const validationSchema =
    contestType === CONSTANTS.LOGO_CONTEST
      ? Schemas.LogoOfferSchema
      : Schemas.TextOfferSchema;

  const renderOfferInput = () => {
    if (contestType === CONSTANTS.LOGO_CONTEST) {
      return (
        <ImageUpload
          name='offerData'
          classes={{
            uploadContainer: styles.imageUploadContainer,
            inputContainer: styles.uploadInputContainer,
            imgStyle: styles.imgStyle,
          }}
        />
      );
    }

    return (
      <FormInput
        name='offerData'
        classes={{
          container: styles.inputContainer,
          input: styles.input,
          warning: styles.fieldWarning,
          notValid: styles.notValid,
        }}
        type='text'
        label='your suggestion'
      />
    );
  };

  return (
    <div className={styles.offerContainer}>
      {addOfferError && (
        <Error
          data={addOfferError.data}
          status={addOfferError.status}
          clearError={handleClearError}
        />
      )}
      <Formik
        onSubmit={setOffer}
        initialValues={{ offerData: '' }}
        validationSchema={validationSchema}
        validateOnMount
      >
        {({ isValid, isSubmitting }) => (
          <Form className={styles.form}>
            {renderOfferInput()}

            <button
              type='submit'
              className={styles.btnOffer}
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Offer'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default OfferForm;
