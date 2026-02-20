import { CURRENCIES } from './currencies';

const DEFAULT = CURRENCIES.PHP;

/** Fallback formatter when outside CurrencyContext. Uses PHP. */
export function formatAmount(amount: number): string {
  return `${DEFAULT.symbol}${amount.toLocaleString(DEFAULT.locale as string, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatAmountCompact(amount: number): string {
  return `${DEFAULT.symbol}${amount.toLocaleString(DEFAULT.locale as string, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
