import classNames from 'classnames';
import InputMask from 'react-input-mask';
import { useField } from 'formik';

const PayInput = ({ name, label, changeFocus, classes, isInputMask, mask }) => {
  const [field, { touched, error }] = useField(name);

  if (field.name === 'sum') {
    return (
      <div className={classes.container}>
        <input
          {...field}
          placeholder={label}
          className={classNames(classes.input, {
            [classes.notValid]: touched && error,
          })}
        />
        {touched && error && <span className={classes.error}>{error}</span>}
      </div>
    );
  }
  if (isInputMask) {
    return (
      <div className={classes.container}>
        <InputMask
          mask={mask}
          maskChar={null}
          {...field}
          placeholder={label}
          className={classNames(classes.input, {
            [classes.notValid]: touched && error,
          })}
          onFocus={() => changeFocus(field.name)}
        />
        {touched && error && <span className={classes.error}>{error}</span>}
      </div>
    );
  }
  return (
    <div className={classes.container}>
      <input
        {...field}
        placeholder={label}
        className={classNames(classes.input, {
          [classes.notValid]: touched && error,
        })}
        onFocus={() => changeFocus(field.name)}
      />
      {touched && error && <span className={classes.error}>{error}</span>}
    </div>
  );
};

export default PayInput;
