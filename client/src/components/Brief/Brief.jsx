import { useDispatch, useSelector } from 'react-redux';
import ContestForm from '../ContestForm/ContestForm';
import styles from './Brief.module.sass';
import ContestInfo from '../Contest/ContestInfo/ContestInfo';
import Error from '../Error/Error';
import {
  clearContestUpdationStore,
  updateContest,
} from '../../store/slices/contestUpdationSlice';
import { changeEditContest } from '../../store/slices/contestByIdSlice';

const Brief = ({ contestData, role, goChat }) => {
  const dispatch = useDispatch();

  const isEditContest = useSelector(
    state => state.contestByIdStore.isEditContest
  );

  const error = useSelector(state => state.contestUpdationStore.error);

  const userId = useSelector(state => state.userStore.data?.id);

  const handleEditChange = mode => {
    dispatch(changeEditContest(mode));
  };

  const handleClearError = () => {
    dispatch(clearContestUpdationStore());
  };
  const setNewContestData = values => {
    const data = new FormData();

    Object.keys(values).forEach(key => {
      if (key !== 'file' && values[key]) {
        data.append(key, values[key]);
      }
    });

    if (values.file instanceof File) {
      data.append('file', values.file);
    }

    data.append('contestId', contestData.id);

    return dispatch(updateContest(data));
  };

  const getContestObjInfo = () => {
    const {
      focusOfWork,
      industry,
      nameVenture,
      styleName,
      targetCustomer,
      title,
      brandStyle,
      typeOfName,
      typeOfTagline,
      originalFileName,
      contestType,
    } = contestData;
    const data = {
      focusOfWork,
      industry,
      nameVenture,
      styleName,
      targetCustomer,
      title,
      brandStyle,
      typeOfName,
      typeOfTagline,
      originalFileName,
      contestType,
    };
    const defaultData = {};
    Object.keys(data).forEach(key => {
      if (data[key]) {
        if (key === 'originalFileName') {
          defaultData.file = { name: data[key] };
        } else {
          defaultData[key] = data[key];
        }
      }
    });
    return defaultData;
  };

  if (!isEditContest) {
    return (
      <ContestInfo
        userId={userId}
        contestData={contestData}
        changeEditContest={handleEditChange}
        role={role}
        goChat={goChat}
      />
    );
  }
  return (
    <div className={styles.contestForm}>
      {error && (
        <Error
          data={error.data}
          status={error.status}
          clearError={handleClearError}
        />
      )}
      <ContestForm
        contestType={contestData.contestType}
        defaultData={getContestObjInfo()}
        handleSubmit={setNewContestData}
      />
    </div>
  );
};

export default Brief;
