import { useId } from 'react';
import { useField } from 'formik';

const FieldFileInput = ({ name, classes }) => {
  const [field, , helpers] = useField(name);
  const inputId = useId();

  const { fileUploadContainer, labelClass, fileNameClass, fileInput } = classes;

  const handleChange = event => {
    helpers.setValue(event.currentTarget.files?.[0] ?? '');
  };

  return (
    <div className={fileUploadContainer}>
      <label htmlFor={inputId} className={labelClass}>
        Choose file
      </label>

      <span className={fileNameClass}>{field.value?.name ?? ''}</span>

      <input
        id={inputId}
        name={field.name}
        type='file'
        className={fileInput}
        onChange={handleChange}
        onBlur={field.onBlur}
      />
    </div>
  );
};

export default FieldFileInput;
