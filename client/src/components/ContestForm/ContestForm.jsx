import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Formik } from 'formik';

import CONSTANTS from '../../constants';
import { getDataForContest } from '../../store/slices/dataForContestSlice';
import Schemas from '../../utils/validators/validationSchemas';

import Spinner from '../Spinner/Spinner';
import FormInput from '../FormInput/FormInput';
import SelectInput from '../SelectInput/SelectInput';
import FieldFileInput from '../InputComponents/FieldFileInput/FieldFileInput';
import FormTextArea from '../InputComponents/FormTextArea/FormTextArea';
import TryAgain from '../TryAgain/TryAgain';
import OptionalSelects from '../OptionalSelects/OptionalSelects';
import ButtonGroup from '../ButtonGroup/ButtonGroup';

import styles from './ContestForm.module.sass';

const domainOptions = [
  {
    value: 'variationsAllowed',
    title: 'Yes',
    description: 'But minor variations are allowed',
    recommended: true,
  },
  {
    value: 'exactMatch',
    title: 'Yes',
    description: 'The Domain should exactly match the name',
  },
  {
    value: 'noDomain',
    title: 'No',
    description: 'I am only looking for a name, not a Domain',
  },
];

const variableOptions = {
  [CONSTANTS.NAME_CONTEST]: {
    styleName: '',
    typeOfName: '',
    domainPreference: 'variationsAllowed',
  },
  [CONSTANTS.LOGO_CONTEST]: {
    nameVenture: '',
    brandStyle: '',
  },
  [CONSTANTS.TAGLINE_CONTEST]: {
    nameVenture: '',
    typeOfTagline: '',
  },
};

const ContestForm = ({ contestType, defaultData, handleSubmit, formRef }) => {
  const dispatch = useDispatch();

  const dataForContest = useSelector(state => state.dataForContest);
  const isEditContest = useSelector(
    state => state.contestByIdStore.isEditContest
  );

  const { data, isFetching, error } = dataForContest;

  const getPreference = useCallback(() => {
    let payload;

    switch (contestType) {
      case CONSTANTS.NAME_CONTEST:
        payload = {
          characteristic1: 'nameStyle',
          characteristic2: 'typeOfName',
        };
        break;

      case CONSTANTS.TAGLINE_CONTEST:
        payload = {
          characteristic1: 'typeOfTagline',
        };
        break;

      case CONSTANTS.LOGO_CONTEST:
        payload = {
          characteristic1: 'brandStyle',
        };
        break;

      default:
        return;
    }

    dispatch(getDataForContest(payload));
  }, [dispatch, contestType]);

  useEffect(() => {
    getPreference();
  }, [getPreference]);

  if (error) {
    return <TryAgain getData={getPreference} />;
  }

  if (isFetching || !data) {
    return <Spinner />;
  }

  return (
    <div className={styles.formContainer}>
      <Formik
        initialValues={{
          title: '',
          industry: '',
          focusOfWork: '',
          targetCustomer: '',
          file: '',
          ...variableOptions[contestType],
          ...defaultData,
          contestType,
        }}
        onSubmit={handleSubmit}
        validationSchema={Schemas.ContestSchema}
        innerRef={formRef}
        enableReinitialize
      >
        <Form>
          <div className={styles.inputContainer}>
            <span className={styles.inputHeader}>Title of contest</span>

            <FormInput
              name='title'
              type='text'
              label='Title'
              classes={{
                container: styles.componentInputContainer,
                input: styles.input,
                warning: styles.warning,
              }}
            />
          </div>

          <div className={styles.inputContainer}>
            <SelectInput
              name='industry'
              header='Describe industry associated with your venture'
              optionsArray={data.industry}
              classes={{
                inputContainer: styles.selectInputContainer,
                inputHeader: styles.selectHeader,
                selectInput: styles.select,
                warning: styles.warning,
              }}
            />
          </div>

          <div className={styles.inputContainer}>
            <span className={styles.inputHeader}>
              What does your company / business do?
            </span>

            <FormTextArea
              name='focusOfWork'
              type='text'
              label='e.g. We`re an online lifestyle brand that provides stylish and high quality apparel to the expert eco-conscious shopper'
              classes={{
                container: styles.componentInputContainer,
                inputStyle: styles.textArea,
                warning: styles.warning,
              }}
            />
          </div>

          <div className={styles.inputContainer}>
            <span className={styles.inputHeader}>
              Tell us about your customers
            </span>

            <FormTextArea
              name='targetCustomer'
              type='text'
              label='customers'
              classes={{
                container: styles.componentInputContainer,
                inputStyle: styles.textArea,
                warning: styles.warning,
              }}
            />
          </div>

          <OptionalSelects
            contestType={contestType}
            dataForContest={dataForContest}
          />
          {contestType === CONSTANTS.NAME_CONTEST && !isEditContest && (
            <ButtonGroup
              name='domainPreference'
              title='Do you want a matching domain (.com URL) with your name?'
              options={domainOptions}
            />
          )}
          <FieldFileInput
            name='file'
            type='file'
            classes={{
              fileUploadContainer: styles.fileUploadContainer,
              labelClass: styles.label,
              fileNameClass: styles.fileName,
              fileInput: styles.fileInput,
              warning: styles.warning,
            }}
          />

          {isEditContest && (
            <button type='submit' className={styles.changeData}>
              Set Data
            </button>
          )}
        </Form>
      </Formik>
    </div>
  );
};

export default ContestForm;
