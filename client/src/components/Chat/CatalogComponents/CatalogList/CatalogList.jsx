import { useDispatch } from 'react-redux';
import Catalog from '../Catalog/Catalog';
import styles from '../CatalogListContainer/CatalogListContainer.module.sass';
import {
  changeShowModeCatalog,
  deleteCatalog,
} from '../../../../store/slices/chatSlice';

const CatalogList = ({ catalogList }) => {
  const dispatch = useDispatch();

  const handleOpenCatalog = (event, catalog) => {
    event.stopPropagation();
    dispatch(changeShowModeCatalog(catalog));
  };

  const handleDeleteCatalog = (event, catalogId) => {
    event.stopPropagation();
    dispatch(deleteCatalog({ catalogId }));
  };

  return (
    <div className={styles.listContainer}>
      {catalogList.length > 0 ? (
        catalogList.map(catalog => (
          <Catalog
            key={catalog._id}
            catalog={catalog}
            deleteCatalog={handleDeleteCatalog}
            goToCatalog={handleOpenCatalog}
          />
        ))
      ) : (
        <span className={styles.notFound}>Not found</span>
      )}
    </div>
  );
};

export default CatalogList;
