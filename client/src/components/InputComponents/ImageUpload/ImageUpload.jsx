import { useEffect, useId, useRef, useState } from 'react';
import { useField } from 'formik';

const supportedTypes = ['image/png', 'image/jpeg', 'image/gif'];

const validateImage = file => {
  if (file && !supportedTypes.includes(file.type)) {
    return 'Choose a PNG, JPEG or GIF image';
  }

  return undefined;
};

const ImageUpload = ({ name, classes }) => {
  const [field, meta, helpers] = useField({
    name,
    validate: validateImage,
  });

  const [previewUrl, setPreviewUrl] = useState('');
  const inputRef = useRef(null);
  const inputId = useId();

  const { uploadContainer, inputContainer, imgStyle } = classes;

  useEffect(() => {
    const file = field.value;

    if (!file) {
      setPreviewUrl('');

      if (inputRef.current) {
        inputRef.current.value = '';
      }

      return undefined;
    }

    if (!supportedTypes.includes(file.type)) {
      setPreviewUrl('');
      return undefined;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [field.value]);

  const handleChange = event => {
    const file = event.currentTarget.files?.[0];

    if (!file) {
      return;
    }

    helpers.setValue(file);
    helpers.setTouched(true, false);
  };

  return (
    <div className={uploadContainer}>
      <div className={inputContainer}>
        <span>Support only images (*.png, *.gif, *.jpeg)</span>

        <input
          ref={inputRef}
          id={inputId}
          name={field.name}
          type='file'
          accept='image/png,image/jpeg,image/gif'
          onChange={handleChange}
          onBlur={field.onBlur}
        />

        <label htmlFor={inputId}>Choose file</label>
      </div>

      {meta.touched && meta.error && <span role='alert'>{meta.error}</span>}

      {previewUrl && (
        <img
          src={previewUrl}
          className={imgStyle}
          alt='Selected image preview'
        />
      )}
    </div>
  );
};

export default ImageUpload;
