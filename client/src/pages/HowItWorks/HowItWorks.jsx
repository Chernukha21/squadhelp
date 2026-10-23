import FAQ from '../../components/FAQ/FAQ';
import styles from './HowItWorks.module.sass';
import { services, contestSteps } from './HowItWorks.data';

const ContestStep = ({ id, text }) => (
  <li className={styles.stepCard}>
    <span className={styles.stepBadge}>Step {id}</span>
    <p>{text}</p>
  </li>
);

const ServiceCard = ({ icon, title, description, buttonText }) => (
  <article className={styles.serviceCard}>
    <img className={styles.serviceIcon} src={icon} alt='' />

    <h3>{title}</h3>

    <p>{description}</p>

    <button type='button' className={styles.serviceButton}>
      <span>{buttonText}</span>
      <span className={styles.buttonArrow} aria-hidden='true'>
        ⟶
      </span>
    </button>
  </article>
);

const HowItWorks = () => (
  <main className={styles.page}>
    <section className={styles.hero}>
      <div className={styles.content}>
        <span className={styles.eyebrow}>World's #1 Naming Platform</span>

        <h1>How Does Atom Work?</h1>

        <p className={styles.heroDescription}>
          Atom helps you come up with a great name for your business by
          combining the power of crowdsourcing with sophisticated technology and
          Agency-level validation services.
        </p>
      </div>

      <div className={styles.consentContainer}>
        <div className={styles.consentCard}>
          <h2>Enable this content?</h2>

          <p>
            This content is served by a third party. If enabled, the service may
            collect information about your activity.
          </p>

          <div className={styles.consentButtons}>
            <button type='button' className={styles.preferencesButton}>
              Preferences
            </button>

            <button type='button' className={styles.enableButton}>
              Enable
            </button>
          </div>
        </div>
      </div>
    </section>

    <section className={styles.services}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionBadge}>Our Services</span>

        <h2>3 Ways To Use Atom</h2>

        <p>Atom offers 3 ways to get you a perfect name for your business.</p>
      </div>

      <div className={styles.servicesGrid}>
        {services.map(service => (
          <ServiceCard key={service.id} {...service} />
        ))}
      </div>
    </section>
    <section className={styles.contestProcess}>
      <div className={styles.processHeading}>
        <img
          src='/staticImages/how-it-works/cup.svg'
          alt=''
          className={styles.processIcon}
        />

        <h2>How Do Naming Contests Work?</h2>
      </div>

      <ol className={styles.stepsList}>
        {contestSteps.map(step => (
          <ContestStep key={step.id} {...step} />
        ))}
      </ol>
    </section>
    <FAQ />
  </main>
);

export default HowItWorks;
