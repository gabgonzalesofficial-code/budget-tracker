export const CURRENCIES = {
  PHP: { symbol: '₱', name: 'Philippine Peso', locale: 'en-PH' },
  USD: { symbol: '$', name: 'US Dollar', locale: 'en-US' },
  EUR: { symbol: '€', name: 'Euro', locale: 'de-DE' },
  GBP: { symbol: '£', name: 'British Pound', locale: 'en-GB' },
  JPY: { symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
  INR: { symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  KRW: { symbol: '₩', name: 'South Korean Won', locale: 'ko-KR' },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;
