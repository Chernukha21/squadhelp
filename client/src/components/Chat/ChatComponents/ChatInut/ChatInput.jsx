import { useDispatch, useSelector } from 'react-redux';
import { Form, Formik } from 'formik';
import { sendMessage } from '../../../../store/slices/chatSlice';
import styles from './ChatInput.module.sass';
import CONSTANTS from '../../../../constants';
import FormInput from '../../../FormInput/FormInput';
import Schemas from '../../../../utils/validators/validationSchemas';

const ChatInput = () => {
  const dispatch = useDispatch();

  const interlocutor = useSelector(state => state.chatStore.interlocutor);

  const submitHandler = async (values, { resetForm }) => {
    const result = await dispatch(
      sendMessage({
        messageBody: values.message,
        recipient: interlocutor.id,
        interlocutor,
      })
    );

    if (sendMessage.fulfilled.match(result)) {
      resetForm();
    }
  };

  return (
    <div className={styles.inputContainer}>
      <Formik
        onSubmit={submitHandler}
        initialValues={{ message: '' }}
        validationSchema={Schemas.MessageSchema}
      >
        {({ isSubmitting }) => (
          <Form className={styles.form}>
            <FormInput
              name='message'
              type='text'
              label='message'
              classes={{
                container: styles.container,
                input: styles.input,
                notValid: styles.notValid,
              }}
            />
            <button type='submit' disabled={isSubmitting}>
              <img
                src={`${CONSTANTS.STATIC_IMAGES_PATH}send.png`}
                alt='Send message'
              />
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ChatInput;
