export type TransactionType = 'expense' | 'income' | 'other_revenue' | 'debt_payment';

export type DebtType = 'loan' | 'credit_card' | 'personal';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color?: string;
  icon_name?: string;
  force_income?: boolean;
}

export type RecurringSchedule = 'bi-monthly' | null;

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: TransactionType;
  category_id: string;
  category?: (Category & { name?: string }) | null;
  debt_id?: string | null;
  debt?: Debt | null;
  description?: string | null;
  date: string;
  notes: string | null;
  recurring_schedule?: RecurringSchedule;
  created_at: string;
}

export interface Debt {
  id: string;
  user_id: string;
  name: string;
  type: DebtType;
  total_amount: number;
  remaining_balance: number;
  interest_rate?: number | null;
  due_date?: string | null;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  category?: Category | null;
  amount: number;
  month: number;
  year: number;
  created_at: string;
}

export interface CategorySpending {
  category_id: string;
  category_name: string;
  amount: number;
  budget: number;
  color?: string;
  icon_name?: string;
}

export interface MonthlyTrend {
  month: string;
  spending: number;
  income: number;
}
