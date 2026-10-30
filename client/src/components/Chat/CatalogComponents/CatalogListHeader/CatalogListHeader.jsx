import { Form, Formik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import {
  changeCatalogName,
  changeRenameCatalogMode,
  changeShowModeCatalog,
} from '../../../../store/slices/chatSlice';
import styles from './CatalogHeader.module.sass';
import FormInput from '../../../FormInput/FormInput';
import Schemas from '../../../../utils/validators/validationSchemas';

const CatalogListHeader = () => {
  const dispatch = useDispatch();

  const { currentCatalog, isRenameCatalog } = useSelector(
    state => state.chatStore
  );

  const handleBack = () => {
    dispatch(changeShowModeCatalog());
  };

  const handleToggleRename = () => {
    dispatch(changeRenameCatalogMode());
  };

  const handleSubmit = values => dispatch(
      changeCatalogName({
        catalogName: values.catalogName,
        catalogId: currentCatalog._id,
      })
    );

  if (!currentCatalog) {
    return null;
  }

  const { catalogName } = currentCatalog;
  return (
    <div className={styles.headerContainer}>
      <i className='fas fa-long-arrow-alt-left' onClick={handleBack} />
      {!isRenameCatalog && (
        <div className={styles.infoContainer}>
          <span>{catalogName}</span>
          <i className='fas fa-edit' onClick={handleToggleRename} />
        </div>
      )}
      {isRenameCatalog && (
        <div className={styles.changeContainer}>
          <Formik
            onSubmit={handleSubmit}
            initialValues={{ catalogName }}
            validationSchema={Schemas.CatalogSchema}
          >
            {({ isSubmitting }) => (
              <Form>
                <FormInput
                  name='catalogName'
                  classes={{
                    container: styles.inputContainer,
                    input: styles.input,
                    warning: styles.fieldWarning,
                    notValid: styles.notValid,
                  }}
                  type='text'
                  label='Catalog Name'
                />
                <button type='submit' disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Change'}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      )}
    </div>
  );
};

export default CatalogListHeader;
