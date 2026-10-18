import styles from './Footer.module.sass';
import CONSTANTS from '../../constants';

const Footer = () => (
  <div className={styles.footerContainer}>
    <div className={styles.footerTop}>
      <div>
        {CONSTANTS.FooterItems.map(section => (
          <div key={section.title}>
            <h4>{section.title}</h4>

            {section.items.map(label => (
              <a key={label} href='https://google.com'>
                {label}
              </a>
            ))}
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Footer;
