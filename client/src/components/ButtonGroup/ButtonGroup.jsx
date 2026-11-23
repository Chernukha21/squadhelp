import classNames from 'classnames';
import styles from './ButtonGroup.module.sass';

const ButtonGroup = ({
  name,
  title,
  options,
  value,
  onChange,
  onBlur,
  error,
}) => {
  const errorId = `${name}-error`;

  return (
    <fieldset
      className={styles.container}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? errorId : undefined}
    >
      <legend className={styles.title}>{title}</legend>

      <div className={styles.options} role='radiogroup'>
        {options.map(option => {
          const isSelected = value === option.value;
          const optionId = `${name}-${option.value}`;

          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={classNames(styles.option, {
                [styles.selected]: isSelected,
              })}
            >
              <input
                id={optionId}
                type='radio'
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={onChange}
                onBlur={onBlur}
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

      {error && (
        <span id={errorId} className={styles.error}>
          {error}
        </span>
      )}
    </fieldset>
  );
};

export default ButtonGroup;
