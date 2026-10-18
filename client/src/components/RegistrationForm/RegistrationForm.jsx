import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Field, Form, Formik } from 'formik';
import Error from '../Error/Error';
import { checkAuth, clearAuth } from '../../store/slices/authSlice';
import styles from './RegistrationForm.module.sass';
import FormInput from '../FormInput/FormInput';
import RoleInput from '../RoleInput/RoleInput';
import AgreeTermOfServiceInput from '../AgreeTermOfServiceInput/AgreeTermOfServiceInput';
import CONSTANTS from '../../constants';
import Schemas from '../../utils/validators/validationSchemas';

const RegistrationForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { error, isFetching } = useSelector(state => state.auth);

  useEffect(() => {
    return () => {
      dispatch(clearAuth());
    };
  }, [dispatch]);

  const handleClearAuth = () => {
    dispatch(clearAuth());
  };

  const handleSubmit = values => {
    const { firstName, lastName, displayName, email, password, role } = values;

    dispatch(
      checkAuth({
        data: {
          firstName,
          lastName,
          displayName,
          email,
          password,
          role,
        },
        navigate,
        authMode: CONSTANTS.AUTH_MODE.REGISTER,
      })
    );
  };

  const formInputClasses = {
    container: styles.inputContainer,
    input: styles.input,
    warning: styles.fieldWarning,
    notValid: styles.notValid,
    valid: styles.valid,
  };

  return (
    <div className={styles.signUpFormContainer}>
      {error && (
        <Error
          data={error.data}
          status={error.status}
          clearError={handleClearAuth}
        />
      )}
      <div className={styles.headerFormContainer}>
        <h2>CREATE AN ACCOUNT</h2>
        <h4>We always keep your name and email address private.</h4>
      </div>
      <Formik
        initialValues={{
          firstName: '',
          lastName: '',
          displayName: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: CONSTANTS.CUSTOMER,
          agreeOfTerms: false,
        }}
        onSubmit={handleSubmit}
        validationSchema={Schemas.RegistrationSchema}
      >
        <Form>
          <div className={styles.row}>
            <FormInput
              name='firstName'
              classes={formInputClasses}
              type='text'
              label='First name'
            />
            <FormInput
              name='lastName'
              classes={formInputClasses}
              type='text'
              label='Last name'
            />
          </div>
          <div className={styles.row}>
            <FormInput
              name='displayName'
              classes={formInputClasses}
              type='text'
              label='Display Name'
            />
            <FormInput
              name='email'
              classes={formInputClasses}
              type='text'
              label='Email Address'
            />
          </div>
          <div className={styles.row}>
            <FormInput
              name='password'
              classes={formInputClasses}
              type='password'
              label='Password'
            />
            <FormInput
              name='confirmPassword'
              classes={formInputClasses}
              type='password'
              label='Password confirmation'
            />
          </div>
          <div className={styles.choseRoleContainer}>
            <Field
              name='role'
              type='radio'
              value={CONSTANTS.CUSTOMER}
              strRole='Join As a Buyer'
              infoRole='I am looking for a Name, Logo or Tagline for my business, brand or product.'
              component={RoleInput}
              id={CONSTANTS.CUSTOMER}
            />
            <Field
              name='role'
              type='radio'
              value={CONSTANTS.CREATOR}
              strRole='Join As a Creative'
              infoRole='I plan to submit name ideas, Logo designs or sell names in Domain Marketplace.'
              component={RoleInput}
              id={CONSTANTS.CREATOR}
            />
          </div>
          <div className={styles.termsOfService}>
            <AgreeTermOfServiceInput
              name='agreeOfTerms'
              classes={{
                container: styles.termsOfService,
                warning: styles.fieldWarning,
              }}
              id='termsOfService'
              type='checkbox'
            />
          </div>
          <button
            type='submit'
            disabled={isFetching}
            className={styles.submitContainer}
          >
            <span className={styles.inscription}>Create Account</span>
          </button>
        </Form>
      </Formik>
    </div>
  );
};

export default RegistrationForm;
