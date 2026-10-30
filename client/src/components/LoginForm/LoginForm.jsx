import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Form, Formik } from 'formik';
import { checkAuth, clearAuth } from '../../store/slices/authSlice';
import Schemas from '../../utils/validators/validationSchemas';
import styles from './LoginForm.module.sass';
import FormInput from '../FormInput/FormInput';
import Error from '../Error/Error';
import CONSTANTS from '../../constants';

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { error, isFetching } = useSelector(state => state.auth);

  useEffect(() => () => {
      dispatch(clearAuth());
    }, [dispatch]);

  const handleSubmit = values => {
    dispatch(
      checkAuth({
        data: values,
        navigate,
        authMode: CONSTANTS.AUTH_MODE.LOGIN,
      })
    );
  };

  const handleClearAuth = () => {
    dispatch(clearAuth());
  };

  const formInputClasses = {
    container: styles.inputContainer,
    input: styles.input,
    warning: styles.fieldWarning,
    notValid: styles.notValid,
    valid: styles.valid,
  };

  return (
    <div className={styles.loginForm}>
      {error && (
        <Error
          data={error.data}
          status={error.status}
          clearError={handleClearAuth}
        />
      )}
      <h2>LOGIN TO YOUR ACCOUNT</h2>
      <Formik
        initialValues={{
          email: '',
          password: '',
        }}
        onSubmit={handleSubmit}
        validationSchema={Schemas.LoginSchema}
      >
        <Form>
          <FormInput
            classes={formInputClasses}
            name='email'
            type='text'
            label='Email Address'
          />
          <FormInput
            classes={formInputClasses}
            name='password'
            type='password'
            label='Password'
          />
          <button
            type='submit'
            disabled={isFetching}
            className={styles.submitContainer}
          >
            <span className={styles.inscription}>
              {isFetching ? 'Submitting...' : 'LOGIN'}
            </span>
          </button>
        </Form>
      </Formik>
    </div>
  );
};
export default LoginForm;
