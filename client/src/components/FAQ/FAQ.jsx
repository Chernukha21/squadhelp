import { useState } from 'react';
import { faqGroups } from '../../pages/HowItWorks/HowItWorks.data';
import styles from './FAQ.module.sass';

const FAQItem = ({ question, answer }) => (
  <details className={styles.faqItem}>
    <summary className={styles.question}>
      <span>{question}</span>
      <span className={styles.icon} aria-hidden='true' />
    </summary>

    <div className={styles.answer}>
      <p>{answer}</p>
    </div>
  </details>
);

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState(faqGroups[0].id);

  const goToCategory = categoryId => {
    setActiveCategory(categoryId);

    document.getElementById(`faq-${categoryId}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <section className={styles.faq}>
      <div className={styles.container}>
        <h2>Frequently Asked Questions</h2>

        <nav className={styles.navigation} aria-label='FAQ categories'>
          {faqGroups.map(group => (
            <button
              key={group.id}
              type='button'
              className={`${styles.navigationButton} ${
                activeCategory === group.id ? styles.active : ''
              }`}
              onClick={() => goToCategory(group.id)}
            >
              {group.title}
            </button>
          ))}
        </nav>

        <div className={styles.groups}>
          {faqGroups.map(group => (
            <section
              key={group.id}
              id={`faq-${group.id}`}
              className={styles.group}
            >
              <h3>{group.title}</h3>

              <div className={styles.questions}>
                {group.items.map(item => (
                  <FAQItem
                    key={item.question}
                    question={item.question}
                    answer={item.answer}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
