import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styles from './ContestCreationPage.module.sass';
import NextButton from '../../components/NextButton/NextButton';
import ContestForm from '../../components/ContestForm/ContestForm';
import BackButton from '../../components/BackButton/BackButton';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import { saveContestToStore } from '../../store/slices/contestCreationSlice';

const ContestCreationPage = ({ contestType, title }) => {
  const formRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const contests = useSelector(state => state.contestCreationStore.contests);
  const bundle = useSelector(state => state.bundleStore.bundle);

  const contestData = contests[contestType] ?? { contestType };
  const nextStep = bundle?.[contestType];

  const handleSubmit = values => {
    dispatch(
      saveContestToStore({
        type: contestType,
        info: values,
      })
    );

    const route =
      nextStep === 'payment' ? '/payment' : `/startContest/${nextStep}Contest`;

    navigate(route);
  };

  const submitForm = () => {
    if (formRef.current) {
      formRef.current.handleSubmit();
    }
  };

  useEffect(() => {
    if (!nextStep) {
      navigate('/startContest', { replace: true });
    }
  }, [nextStep, navigate]);

  if (!nextStep) {
    return null;
  }

  return (
    <div>
      <div className={styles.startContestHeader}>
        <div className={styles.startContestInfo}>
          <h2>{title}</h2>
          <span>
            Tell us a bit more about your business as well as your preferences
            so that creatives get a better idea about what you are looking for
          </span>
        </div>
        <ProgressBar currentStep={2} />
      </div>
      <div className={styles.container}>
        <div className={styles.formContainer}>
          <ContestForm
            contestType={contestType}
            handleSubmit={handleSubmit}
            formRef={formRef}
            defaultData={contestData}
          />
        </div>
      </div>
      <div className={styles.footerButtonsContainer}>
        <div className={styles.lastContainer}>
          <div className={styles.buttonsContainer}>
            <BackButton />
            <NextButton submit={submitForm} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestCreationPage;
