import { Link, useLocation } from 'react-router-dom';
import Logo from '../../Logo';
import styles from './AuthHeader.module.sass';
import CONSTANTS from '../../../constants';

const AuthHeader = () => {
  const { pathname } = useLocation();
  const isLoginPage = pathname === '/login';

  return (
    <header className={styles.container}>
      <div className={styles.loginContainer}>
        <div className={styles.headerAuthPage}>
          <Logo
            className={styles.logo}
            src={`${CONSTANTS.STATIC_IMAGES_PATH}logo.png`}
            alt='Squadhelp'
          />

          <Link
            to={isLoginPage ? '/registration' : '/login'}
            className={styles.linkAuthContainer}
          >
            {isLoginPage ? 'Signup' : 'Login'}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default AuthHeader;
