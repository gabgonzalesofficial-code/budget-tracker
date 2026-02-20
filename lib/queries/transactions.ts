import { createClient } from '@/lib/supabase/client';
import { resolveTransactionType } from '@/lib/salary';
import type { Transaction, TransactionType } from '@/lib/types';

export interface ListTransactionsParams {
  from?: string;
  to?: string;
  type?: TransactionType;
  limit?: number;
}

export async function listTransactions(params: ListTransactionsParams = {}): Promise<Transaction[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from('transactions')
    .select('*, category:categories(*), debt:debts(name)')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  if (params.from) query = query.gte('date', params.from);
  if (params.to) query = query.lte('date', params.to);
  if (params.type) query = query.eq('type', params.type);
  if (params.limit) query = query.limit(params.limit);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Transaction[];
}

export interface InsertTransactionParams {
  amount: number;
  type: TransactionType;
  category_id: string;
  description?: string | null;
  date: string;
  notes?: string | null;
  recurring_schedule?: 'bi-monthly' | null;
}

export async function insertTransaction(tx: InsertTransactionParams): Promise<Transaction> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: category } = await supabase
    .from('categories')
    .select('force_income')
    .eq('id', tx.category_id)
    .single();

  const resolvedType = resolveTransactionType(tx.type, Boolean(category?.force_income));

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      amount: tx.amount,
      type: resolvedType,
      category_id: tx.category_id,
      description: tx.description ?? null,
      date: tx.date,
      notes: tx.notes ?? null,
      recurring_schedule: tx.recurring_schedule ?? null,
    })
    .select('*, category:categories(*)')
    .single();

  if (error) throw error;
  return data as Transaction;
}

export async function getMonthlyTrends(months: number = 6): Promise<{ month: string; spending: number; income: number }[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - months);
  start.setDate(1);

  const { data, error } = await supabase
    .from('transactions')
    .select('date, amount, type')
    .eq('user_id', user.id)
    .gte('date', start.toISOString().slice(0, 10))
    .lte('date', end.toISOString().slice(0, 10));

  if (error) throw error;

  const byMonth: Record<string, { spending: number; income: number }> = {};
  for (let i = 0; i < months; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toISOString().slice(0, 7);
    byMonth[key] = { spending: 0, income: 0 };
  }

  for (const row of data ?? []) {
    const key = String(row.date).slice(0, 7);
    if (!byMonth[key]) byMonth[key] = { spending: 0, income: 0 };
    if (row.type === 'expense') {
      byMonth[key].spending += Number(row.amount);
    } else if (row.type === 'income' || row.type === 'other_revenue') {
      byMonth[key].income += Number(row.amount);
    }
  }

  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({
      month: new Date(month + '-01').toLocaleString('default', { month: 'short' }),
      spending: Math.round(v.spending * 100) / 100,
      income: Math.round(v.income * 100) / 100,
    }));
}
