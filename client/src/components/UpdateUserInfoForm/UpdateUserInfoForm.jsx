import { Form, Formik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { clearUserError } from '../../store/slices/userSlice';
import styles from './UpdateUserInfoForm.module.sass';
import ImageUpload from '../InputComponents/ImageUpload/ImageUpload';
import FormInput from '../FormInput/FormInput';
import Schemas from '../../utils/validators/validationSchemas';
import Error from '../Error/Error';

const UpdateUserInfoForm = ({ onSubmit }) => {
  const dispatch = useDispatch();

  const { data, error } = useSelector(state => state.userStore);

  const handleClearError = () => {
    dispatch(clearUserError());
  };

  const initialValues = {
    firstName: data.firstName,
    lastName: data.lastName,
    displayName: data.displayName,
    file: '',
  };

  return (
    <Formik
      onSubmit={onSubmit}
      initialValues={initialValues}
      validationSchema={Schemas.UpdateUserSchema}
    >
      {({ isSubmitting }) => (
        <Form className={styles.updateContainer}>
          {error && (
            <Error
              data={error.data}
              status={error.status}
              clearError={handleClearError}
            />
          )}
          <div className={styles.container}>
            <span className={styles.label}>First Name</span>
            <FormInput
              name='firstName'
              type='text'
              label='First Name'
              classes={{
                container: styles.inputContainer,
                input: styles.input,
                warning: styles.error,
                notValid: styles.notValid,
              }}
            />
          </div>
          <div className={styles.container}>
            <span className={styles.label}>Last Name</span>
            <FormInput
              name='lastName'
              type='text'
              label='LastName'
              classes={{
                container: styles.inputContainer,
                input: styles.input,
                warning: styles.error,
                notValid: styles.notValid,
              }}
            />
          </div>
          <div className={styles.container}>
            <span className={styles.label}>Display Name</span>
            <FormInput
              name='displayName'
              type='text'
              label='Display Name'
              classes={{
                container: styles.inputContainer,
                input: styles.input,
                warning: styles.error,
                notValid: styles.notValid,
              }}
            />
          </div>
          <ImageUpload
            name='file'
            classes={{
              uploadContainer: styles.imageUploadContainer,
              inputContainer: styles.uploadInputContainer,
              imgStyle: styles.imgStyle,
            }}
          />
          <button type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Submit'}
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default UpdateUserInfoForm;
