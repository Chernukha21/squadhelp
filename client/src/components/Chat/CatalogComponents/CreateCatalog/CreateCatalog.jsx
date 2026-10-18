import { useDispatch, useSelector } from 'react-redux';
import { Form, Formik } from 'formik';
import FormInput from '../../../FormInput/FormInput';
import styles from './CreateCatalog.module.sass';
import { createCatalog } from '../../../../store/slices/chatSlice';
import Schemas from '../../../../utils/validators/validationSchemas';

const CreateCatalog = () => {
  const dispatch = useDispatch();

  const addChatId = useSelector(state => state.chatStore.addChatId);

  const handleSubmit = values => {
    return dispatch(
      createCatalog({
        catalogName: values.catalogName,
        chatId: addChatId,
      })
    );
  };
  return (
    <Formik
      onSubmit={handleSubmit}
      initialValues={{ catalogName: '' }}
      validationSchema={Schemas.CatalogSchema}
    >
      {({ isSubmitting }) => (
        <Form className={styles.form}>
          <FormInput
            name='catalogName'
            type='text'
            label='name of catalog'
            classes={{
              container: styles.inputContainer,
              input: styles.input,
              warning: styles.fieldWarning,
              notValid: styles.notValid,
            }}
          />
          <button type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Catalog'}
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default CreateCatalog;
