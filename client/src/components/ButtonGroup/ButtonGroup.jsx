import classNames from 'classnames';
import { useField } from 'formik';
import styles from './ButtonGroup.module.sass';

const ButtonGroup = ({ name, title, options }) => {
  const [field, meta] = useField(name);

  const showError = meta.touched && meta.error;

  return (
    <fieldset className={styles.container}>
      <legend className={styles.title}>{title}</legend>

      <div className={styles.options} role='radiogroup'>
        {options.map(option => {
          const isSelected = field.value === option.value;

          return (
            <label
              key={option.value}
              className={classNames(styles.option, {
                [styles.selected]: isSelected,
              })}
            >
              <input
                type='radio'
                name={field.name}
                value={option.value}
                checked={isSelected}
                onChange={field.onChange}
                onBlur={field.onBlur}
                className={styles.radio}
              />

              {option.recommended && (
                <span className={styles.recommended}>Recommended</span>
              )}

              {isSelected && (
                <span className={styles.check} aria-hidden='true'>
                  ✓
                </span>
              )}

              <span className={styles.optionTitle}>{option.title}</span>

              <span className={styles.description}>{option.description}</span>
            </label>
          );
        })}
      </div>

      {showError && <span className={styles.error}>{meta.error}</span>}
    </fieldset>
  );
};

export default ButtonGroup;
