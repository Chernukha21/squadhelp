import { useDispatch, useSelector } from 'react-redux';
import { Form, Formik } from 'formik';
import SelectInput from '../../../SelectInput/SelectInput';
import { addChatToCatalog } from '../../../../store/slices/chatSlice';
import styles from './AddToCatalog.module.sass';

const AddToCatalog = () => {
  const dispatch = useDispatch();

  const { catalogList, addChatId } = useSelector(state => state.chatStore);

  const catalogNames = catalogList.map(catalog => catalog.catalogName);
  const catalogIds = catalogList.map(catalog => catalog._id);

  const handleSubmit = values => dispatch(
      addChatToCatalog({
        chatId: addChatId,
        catalogId: values.catalogId,
      })
    );

  return catalogNames.length > 0 ? (
    <Formik onSubmit={handleSubmit} initialValues={{ catalogId: '' }}>
      {({ isSubmitting }) => (
        <Form className={styles.form}>
          <SelectInput
            name='catalogId'
            header='name of catalog'
            classes={{
              inputContainer: styles.selectInputContainer,
              inputHeader: styles.selectHeader,
              selectInput: styles.select,
            }}
            optionsArray={catalogNames}
            valueArray={catalogIds}
          />
          <button type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add'}
          </button>
        </Form>
      )}
    </Formik>
  ) : (
    <div className={styles.notFound}>You have not created any directories.</div>
  );
};

export default AddToCatalog;
