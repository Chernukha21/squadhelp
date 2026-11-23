import { useEffect, useRef, useState } from 'react';
import { faqGroups } from '../../pages/HowItWorks/HowItWorks.data';
import styles from './FAQ.module.sass';
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/700.css';

const CATEGORY_SCROLL_DELAY = 500;

const FAQItem = ({ id, question, answer, isOpen, onToggle }) => {
  const answerId = `faq-answer-${id}`;

  return (
    <div className={`${styles.faqItem} ${isOpen ? styles.open : ''}`}>
      <button
        type='button'
        className={styles.question}
        aria-expanded={isOpen}
        aria-controls={answerId}
        onClick={onToggle}
      >
        <span>{question}</span>
        <span className={styles.icon} aria-hidden='true' />
      </button>

      <div id={answerId} className={styles.answerWrapper} aria-hidden={!isOpen}>
        <div className={styles.answerInner}>
          <div className={styles.answer}>
            <p>{answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState(faqGroups[0].id);
  const [openItemIds, setOpenItemIds] = useState(() => new Set());
  const categoryScrollTimeoutRef = useRef(null);

  useEffect(
    () => () => window.clearTimeout(categoryScrollTimeoutRef.current),
    []
  );

  const toggleItem = itemId => {
    setOpenItemIds(currentItemIds => {
      const nextItemIds = new Set(currentItemIds);

      if (nextItemIds.has(itemId)) {
        nextItemIds.delete(itemId);
      } else {
        nextItemIds.add(itemId);
      }

      return nextItemIds;
    });
  };

  const goToCategory = (categoryId, event) => {
    setActiveCategory(categoryId);

    event?.currentTarget.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });

    window.clearTimeout(categoryScrollTimeoutRef.current);

    categoryScrollTimeoutRef.current = window.setTimeout(() => {
      document.getElementById(`faq-${categoryId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, CATEGORY_SCROLL_DELAY);
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
              onClick={event => goToCategory(group.id, event)}
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
                {group.items.map((item, itemIndex) => {
                  const itemId = `${group.id}-${itemIndex}`;

                  return (
                    <FAQItem
                      key={item.question}
                      id={itemId}
                      question={item.question}
                      answer={item.answer}
                      isOpen={openItemIds.has(itemId)}
                      onToggle={() => toggleItem(itemId)}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
