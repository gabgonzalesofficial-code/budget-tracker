const CURRENCY = 'PHP';
const SYMBOL = '₱';

export function formatAmount(amount: number): string {
  return `${SYMBOL}${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatAmountCompact(amount: number): string {
  return `${SYMBOL}${amount.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
