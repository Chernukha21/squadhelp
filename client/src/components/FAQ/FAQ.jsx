import { useState } from 'react';
import styles from './FAQ.module.sass';

const faqGroups = [
  {
    id: 'launching-contest',
    title: 'Launching A Contest',
    items: [
      {
        question: 'How long does it take to start receiving submissions?',
        answer:
          'You can typically start receiving name ideas within several minutes after launching your contest.',
      },
      {
        question: 'How long do Naming Contests last?',
        answer:
          'Most naming contests run for several days, giving creatives enough time to submit and improve their ideas.',
      },
      {
        question: 'Where are the creatives located?',
        answer:
          'Our creative community includes naming experts from many different countries around the world.',
      },
      {
        question: 'What if I do not like any submissions?',
        answer:
          'You can provide feedback and ratings so creatives can submit new ideas that better match your requirements.',
      },
      {
        question: 'How much does it cost?',
        answer:
          'The final price depends on the selected contest package and any additional services.',
      },
      {
        question:
          'I need both a Name and a Logo. Do you offer any discount for multiple contests?',
        answer:
          'You can combine several contest types into one order and receive package pricing.',
      },
      {
        question: 'What if I want to keep my business idea private?',
        answer:
          'Private contest options allow you to limit access to your contest information.',
      },
      {
        question: 'Can you serve customers outside the US?',
        answer:
          'Yes. The platform is available to customers and creatives from around the world.',
      },
      {
        question: 'Can I see any examples?',
        answer:
          'You can explore completed contests and winning submissions to see examples of previous work.',
      },
    ],
  },
  {
    id: 'marketplace',
    title: 'Buying From Marketplace',
    items: [
      {
        question: "What's included with a Domain Purchase?",
        answer:
          'A domain purchase includes ownership transfer of the domain and the services specified on its listing page.',
      },
      {
        question: 'How does the Domain transfer process work?',
        answer:
          'After payment, the transfer process begins and you receive instructions for moving the domain to your registrar.',
      },
      {
        question:
          'If I purchase a Domain on installments, can I start using it to setup my website?',
        answer:
          'Installment conditions depend on the selected domain, but many domains can be used while payments are active.',
      },
    ],
  },
  {
    id: 'managed-contests',
    title: 'Managed Contests',
    items: [
      {
        question: 'What are Managed Contests?',
        answer:
          'Managed contests combine community submissions with guidance from branding specialists.',
      },
      {
        question: "What's a typical timeline for a Managed Contest?",
        answer:
          'The timeline depends on the project, but managed contests usually include several stages of research and review.',
      },
      {
        question: 'How much do Managed Contests cost?',
        answer:
          'Pricing depends on the required services and the complexity of the branding project.',
      },
      {
        question: 'Where are the Branding Consultants located?',
        answer:
          'Branding consultants work remotely and collaborate with customers from different countries.',
      },
    ],
  },
  {
    id: 'creatives',
    title: 'For Creatives',
    items: [
      {
        question: 'Can anyone join your platform?',
        answer:
          'Anyone can apply, but accounts may be reviewed before creatives can fully participate.',
      },
      {
        question: 'Can I start participating immediately upon signing up?',
        answer:
          'After completing registration and any required account verification, you can begin participating in available contests.',
      },
      {
        question: 'How Do I Get Paid?',
        answer:
          'Winning creatives receive their contest awards through the supported payout methods.',
      },
    ],
  },
];

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
