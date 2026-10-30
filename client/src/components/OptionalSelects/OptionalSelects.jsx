import CONSTANTS from '../../constants';
import SelectInput from '../SelectInput/SelectInput';
import FormInput from '../FormInput/FormInput';
import styles from '../ContestForm/ContestForm.module.sass';
import Spinner from '../Spinner/Spinner';

const OptionalSelects = ({ contestType, dataForContest }) => {
  const { isFetching, data } = dataForContest;

  if (isFetching) {
    return <Spinner />;
  }

  if (!data) {
    return null;
  }

  switch (contestType) {
    case CONSTANTS.NAME_CONTEST: {
      return (
        <>
          <SelectInput
            name='typeOfName'
            header='type of company'
            classes={{
              inputContainer: styles.selectInputContainer,
              inputHeader: styles.selectHeader,
              selectInput: styles.select,
              warning: styles.warning,
            }}
            optionsArray={data.typeOfName}
          />
          <SelectInput
            name='styleName'
            header='Style name'
            classes={{
              inputContainer: styles.selectInputContainer,
              inputHeader: styles.selectHeader,
              selectInput: styles.select,
              warning: styles.warning,
            }}
            optionsArray={data.nameStyle}
          />
        </>
      );
    }
    case CONSTANTS.LOGO_CONTEST: {
      return (
        <>
          <div className={styles.inputContainer}>
            <span className={styles.inputHeader}>
              What name of your venture?
            </span>
            <FormInput
              name='nameVenture'
              type='text'
              label='name of venture'
              classes={{
                container: styles.componentInputContainer,
                input: styles.input,
                warning: styles.warning,
              }}
            />
          </div>
          <SelectInput
            name='brandStyle'
            classes={{
              inputContainer: styles.selectInputContainer,
              inputHeader: styles.selectHeader,
              selectInput: styles.select,
              warning: styles.warning,
            }}
            header='Brand Style'
            optionsArray={data.brandStyle}
          />
        </>
      );
    }
    case CONSTANTS.TAGLINE_CONTEST: {
      return (
        <>
          <div className={styles.inputContainer}>
            <span className={styles.inputHeader}>
              What name of your venture?
            </span>
            <FormInput
              name='nameVenture'
              type='text'
              label='name of venture'
              classes={{
                container: styles.componentInputContainer,
                input: styles.input,
                warning: styles.warning,
              }}
            />
          </div>
          <SelectInput
            name='typeOfTagline'
            classes={{
              inputContainer: styles.selectInputContainer,
              inputHeader: styles.selectHeader,
              selectInput: styles.select,
              warning: styles.warning,
            }}
            header='Type tagline'
            optionsArray={data.typeOfTagline}
          />
        </>
      );
    }
    default:
      return null;
  }
};

export default OptionalSelects;
