export const PLACEHOLDER_URL = 'https://www.google.com';

export const EVENTS_MENU_ITEM = {
  key: 'events',
  label: 'EVENTS',
  to: '/events',
};

export const MENU_ITEMS = [
  {
    key: 'nameIdeas',
    label: 'NAME IDEAS',
    links: [
      'Beauty',
      'Consulting',
      'E-Commerce',
      'Fashion & Clothing',
      'Finance',
      'Real Estate',
      'Tech',
      'More Categories',
    ].map(label => ({ label, href: PLACEHOLDER_URL })),
  },
  {
    key: 'contests',
    label: 'CONTESTS',
    links: [
      { label: 'HOW IT WORKS', to: '/how-it-works' },
      { label: 'PRICING', href: PLACEHOLDER_URL },
      { label: 'AGENCY SERVICE', href: PLACEHOLDER_URL },
      { label: 'ACTIVE CONTESTS', href: PLACEHOLDER_URL },
      { label: 'WINNERS', href: PLACEHOLDER_URL },
      { label: 'LEADERBOARD', href: PLACEHOLDER_URL },
      { label: 'BECOME A CREATIVE', href: PLACEHOLDER_URL },
    ],
  },
  {
    key: 'ourWork',
    label: 'Our Work',
    links: ['NAMES', 'TAGLINES', 'LOGOS', 'TESTIMONIALS'].map(label => ({
      label,
      href: PLACEHOLDER_URL,
    })),
  },
  {
    key: 'namesForSale',
    label: 'Names For Sale',
    links: [
      'POPULAR NAMES',
      'SHORT NAMES',
      'INTRIGUING NAMES',
      'NAMES BY CATEGORY',
      'VISUAL NAME SEARCH',
      'SELL YOUR DOMAINS',
    ].map(label => ({ label, href: PLACEHOLDER_URL })),
  },
  {
    key: 'blog',
    label: 'Blog',
    links: [
      'ULTIMATE NAMING GUIDE',
      'POETIC DEVICES IN BUSINESS NAMING',
      'CROWDED BAR THEORY',
      'ALL ARTICLES',
    ].map(label => ({ label, href: PLACEHOLDER_URL })),
  },
];
