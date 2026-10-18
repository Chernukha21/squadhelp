import { useNavigate } from 'react-router-dom';
import styles from './BackButton.module.sass';

const BackButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(-1);
  };

  return (
    <button
      type='button'
      onClick={handleClick}
      className={styles.buttonContainer}
    >
      <span>Back</span>
    </button>
  );
};

export default BackButton;
