import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import styles from './Header.module.sass';
import CONSTANTS from '../../constants';
import { clearUserStore, getUser } from '../../store/slices/userSlice';
import { controller } from '../../api/ws/socketController';
import EventsBadge from '../EventsBadge/EventsBadge';
import { EVENTS_MENU_ITEM, MENU_ITEMS, PLACEHOLDER_URL } from './Header.data';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data, isFetching } = useSelector(state => state.userStore);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const menuRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem(CONSTANTS.ACCESS_TOKEN);

    if (token && !data) {
      dispatch(getUser());
    }
  }, [data, dispatch]);

  useEffect(() => {
    const handleEscape = event => {
      if (event.key !== 'Escape') return;

      setIsMenuOpen(false);
      setOpenSubmenu(null);

      if (userMenuRef.current) {
        userMenuRef.current.open = false;
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const closeUserMenu = () => {
    if (userMenuRef.current) {
      userMenuRef.current.open = false;
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setOpenSubmenu(null);
    closeUserMenu();
  };

  const toggleMobileMenu = () => {
    setIsMenuOpen(current => !current);
    setOpenSubmenu(null);
    closeUserMenu();
    menuRef.current?.scrollTo({ top: 0 });
  };

  const closeSubmenu = () => {
    setOpenSubmenu(null);
    menuRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSubmenu = key => {
    setOpenSubmenu(current => (current === key ? null : key));
  };

  const logOut = () => {
    if (data?.id != null) {
      controller?.unsubscribe(data.id);
    }

    localStorage.removeItem(CONSTANTS.ACCESS_TOKEN);
    dispatch(clearUserStore());
    closeMenu();
    navigate('/login', { replace: true });
  };

  const startContests = () => {
    closeMenu();
    navigate('/startContest');
  };

  const renderLoginButtons = () => {
    if (isFetching && !data) {
      return <span>Loading...</span>;
    }

    if (!data) {
      return (
        <>
          <Link to='/login' className={styles.authLink}>
            LOGIN
          </Link>

          <Link to='/registration' className={styles.authLink}>
            SIGN UP
          </Link>
        </>
      );
    }

    return (
      <>
        <details className={styles.userInfo} ref={userMenuRef}>
          <summary className={styles.userToggle}>
            <img
              src={
                data.avatar === 'anon.png'
                  ? CONSTANTS.ANONYM_IMAGE_PATH
                  : `${CONSTANTS.publicURL}${data.avatar}`
              }
              alt=''
              className={styles.avatar}
            />

            <span>Hi, {data.displayName}</span>

            <img
              src={`${CONSTANTS.STATIC_IMAGES_PATH}menu-down.png`}
              alt=''
              className={styles.dropdownArrow}
            />
          </summary>

          <ul className={styles.userDropdown}>
            <li>
              <Link to='/dashboard' onClick={closeUserMenu}>
                View Dashboard
              </Link>
            </li>

            <li>
              <Link to='/account' onClick={closeUserMenu}>
                My Account
              </Link>
            </li>

            <li>
              <a href={PLACEHOLDER_URL}>Messages</a>
            </li>

            <li>
              <a href={PLACEHOLDER_URL}>Affiliate Dashboard</a>
            </li>

            <li>
              <button type='button' onClick={logOut}>
                Logout
              </button>
            </li>
          </ul>
        </details>

        <img
          src={`${CONSTANTS.STATIC_IMAGES_PATH}email.png`}
          className={styles.emailIcon}
          alt=''
        />
      </>
    );
  };

  const navigationItems = data
    ? [...MENU_ITEMS.slice(0, 2), EVENTS_MENU_ITEM, ...MENU_ITEMS.slice(2)]
    : MENU_ITEMS;

  const openSubmenuLabel = navigationItems.find(
    item => item.key === openSubmenu
  )?.label;

  return (
    <header className={styles.headerContainer}>
      <div className={styles.fixedHeader}>
        <span>
          Squadhelp recognized as one of the Most Innovative Companies by Inc
          Magazine.
        </span>

        <a href={PLACEHOLDER_URL}>Read Announcement</a>
      </div>

      <div className={styles.loginSignnUpHeaders}>
        <a href='tel:8773553585' className={styles.numberContainer}>
          <img src={`${CONSTANTS.STATIC_IMAGES_PATH}phone.png`} alt='' />

          <span>(877)&nbsp;355-3585</span>
        </a>

        <div className={styles.userButtonsContainer}>
          {renderLoginButtons()}
        </div>
      </div>

      <div className={styles.navContainer}>
        <div className={styles.navInner}>
          <Link to='/' className={styles.logoLink} onClick={closeMenu}>
            <img
              src={`${CONSTANTS.STATIC_IMAGES_PATH}blue-logo.png`}
              className={styles.logo}
              alt='Squadhelp — home'
            />
          </Link>

          <button
            type='button'
            className={`${styles.menuToggle} ${
              isMenuOpen ? styles.menuToggleOpen : ''
            }`}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls='primary-navigation'
            onClick={toggleMobileMenu}
          >
            <span />
            <span />
            <span />
          </button>

          <div
            id='primary-navigation'
            ref={menuRef}
            className={`${styles.leftNav} ${isMenuOpen ? styles.menuOpen : ''}`}
          >
            {openSubmenu && (
              <button
                type='button'
                className={styles.submenuClose}
                onClick={closeSubmenu}
              >
                ↑ Close {openSubmenuLabel}
              </button>
            )}

            <nav className={styles.nav} aria-label='Main navigation'>
              <ul>
                {navigationItems.map(item => (
                  <li
                    key={item.key}
                    className={`${styles.navItem} ${
                      openSubmenu === item.key ? styles.submenuOpen : ''
                    }`}
                  >
                    {item.to ? (
                      <Link
                        to={item.to}
                        className={styles.navLink}
                        onClick={closeMenu}
                      >
                        {item.label}
                        {item.key === 'events' && <EventsBadge />}
                      </Link>
                    ) : (
                      <>
                        <button
                          type='button'
                          className={styles.navTrigger}
                          aria-expanded={openSubmenu === item.key}
                          aria-controls={`${item.key}-submenu`}
                          onClick={() => toggleSubmenu(item.key)}
                        >
                          {item.label}

                          <img
                            src={`${CONSTANTS.STATIC_IMAGES_PATH}menu-down.png`}
                            alt=''
                          />
                        </button>

                        <ul
                          id={`${item.key}-submenu`}
                          className={styles.dropdown}
                        >
                          {item.links.map(link => (
                            <li key={link.label}>
                              {link.to ? (
                                <Link to={link.to} onClick={closeMenu}>
                                  {link.label}
                                </Link>
                              ) : (
                                <a href={link.href}>{link.label}</a>
                              )}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {data && data.role !== CONSTANTS.CREATOR && (
              <button
                type='button'
                className={styles.startContestBtn}
                onClick={startContests}
              >
                START CONTEST
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
