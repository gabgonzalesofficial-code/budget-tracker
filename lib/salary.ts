import type { Category, TransactionType } from './types';

export function isSalaryCategory(category: Category | null | undefined): boolean {
  return Boolean(category?.force_income);
}

export function resolveTransactionType(
  requestedType: TransactionType,
  categoryForceIncome: boolean
): TransactionType {
  return categoryForceIncome ? 'income' : requestedType;
}

export function getNextBiMonthlyPayDate(after: Date): Date {
  const d = new Date(after);
  d.setHours(0, 0, 0, 0);
  const day = d.getDate();
  if (day < 15) {
    d.setDate(15);
  } else {
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    const endOfMonth = Math.min(30, lastDay);
    if (day < endOfMonth) {
      d.setDate(endOfMonth);
    } else {
      d.setMonth(d.getMonth() + 1);
      d.setDate(15);
    }
  }
  return d;
}
