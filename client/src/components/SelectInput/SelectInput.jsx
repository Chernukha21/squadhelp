import { useLayoutEffect } from 'react';
import { Field, ErrorMessage } from 'formik';

const SelectInput = ({
  header,
  classes,
  optionsArray,
  valueArray,
  ...props
}) => {
  const {
    form: { setFieldValue },
    field,
  } = props;

  const getOptionsArray = () => {
    const array = [];
    for (let i = 0; optionsArray && i < optionsArray.length; i += 1) {
      let option;
      if (valueArray) {
        option = (
          <option key={i} value={valueArray[i]}>
            {optionsArray[i]}
          </option>
        );
      } else {
        option = <option key={i}>{optionsArray[i]}</option>;
      }
      array.push(option);
    }
    return array;
  };

  useLayoutEffect(() => {
    const hasValue = field.value != null && field.value !== '';

    if (hasValue || !optionsArray?.length) {
      return;
    }

    const firstValue = valueArray ? valueArray[0] : optionsArray[0];

    if (firstValue != null && firstValue !== field.value) {
      setFieldValue(field.name, firstValue);
    }
  }, [field.name, field.value, optionsArray, valueArray, setFieldValue]);

  return (
    <div className={classes.inputContainer}>
      <span className={classes.inputHeader}>{header}</span>
      <select {...field} className={classes.selectInput}>
        {getOptionsArray()}
      </select>
    </div>
  );
};

const SelectInputWrapper = ({
  header,
  classes,
  optionsArray,
  valueArray,
  ...rest
}) => (
  <Field {...rest}>
    {fieldProps => (
      <>
        <SelectInput
          {...fieldProps}
          header={header}
          classes={classes}
          optionsArray={optionsArray}
          valueArray={valueArray}
        />
        <ErrorMessage
          name={fieldProps.field.name}
          component='span'
          className={classes.warning}
        />
      </>
    )}
  </Field>
);

export default SelectInputWrapper;
