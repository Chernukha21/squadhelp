import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import CONSTANTS from '../../../../constants';
import {
  changeShowAddChatToCatalogMenu,
  changeTypeOfChatAdding,
  getCatalogList,
} from '../../../../store/slices/chatSlice';
import styles from './CatalogCreation.module.sass';
import AddToCatalog from '../AddToCatalog/AddToCatalog';
import CreateCatalog from '../CreateCatalog/CreateCatalog';

const CatalogCreation = () => {
  const dispatch = useDispatch();

  const { catalogCreationMode, isFetching } = useSelector(
    state => state.chatStore
  );

  const { ADD_CHAT_TO_OLD_CATALOG, CREATE_NEW_CATALOG_AND_ADD_CHAT } =
    CONSTANTS;

  useEffect(() => {
    dispatch(getCatalogList());
  }, [dispatch]);

  const handleModeChange = mode => {
    dispatch(changeTypeOfChatAdding(mode));
  };

  const handleClose = () => {
    dispatch(changeShowAddChatToCatalogMenu());
  };

  if (isFetching) {
    return null;
  }
  return (
    <div className={styles.catalogCreationContainer}>
      <i className='far fa-times-circle' onClick={handleClose} />
      <div className={styles.buttonsContainer}>
        <span
          onClick={() => handleModeChange(ADD_CHAT_TO_OLD_CATALOG)}
          className={classNames({
            [styles.active]: catalogCreationMode === ADD_CHAT_TO_OLD_CATALOG,
          })}
        >
          Old
        </span>
        <span
          onClick={() => handleModeChange(CREATE_NEW_CATALOG_AND_ADD_CHAT)}
          className={classNames({
            [styles.active]:
              catalogCreationMode === CREATE_NEW_CATALOG_AND_ADD_CHAT,
          })}
        >
          New
        </span>
      </div>
      {catalogCreationMode === CREATE_NEW_CATALOG_AND_ADD_CHAT ? (
        <CreateCatalog />
      ) : (
        <AddToCatalog />
      )}
    </div>
  );
};

export default CatalogCreation;
