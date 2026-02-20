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

export interface UpdateTransactionParams {
  amount?: number;
  type?: TransactionType;
  category_id?: string;
  description?: string | null;
  date?: string;
  notes?: string | null;
  recurring_schedule?: 'bi-monthly' | null;
}

export async function updateTransaction(id: string, tx: UpdateTransactionParams): Promise<Transaction> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const updates: Record<string, unknown> = {};
  if (tx.amount !== undefined) updates.amount = tx.amount;
  if (tx.type !== undefined) updates.type = tx.type;
  if (tx.category_id !== undefined) updates.category_id = tx.category_id;
  if (tx.description !== undefined) updates.description = tx.description;
  if (tx.date !== undefined) updates.date = tx.date;
  if (tx.notes !== undefined) updates.notes = tx.notes;
  if (tx.recurring_schedule !== undefined) updates.recurring_schedule = tx.recurring_schedule;

  if (Object.keys(updates).length === 0) {
    const { data } = await supabase.from('transactions').select('*, category:categories(*), debt:debts(name)').eq('id', id).eq('user_id', user.id).single();
    if (!data) throw new Error('Transaction not found');
    return data as Transaction;
  }

  if (tx.category_id !== undefined && tx.type !== undefined) {
    const { data: category } = await supabase
      .from('categories')
      .select('force_income')
      .eq('id', tx.category_id)
      .single();
    updates.type = resolveTransactionType(tx.type, Boolean(category?.force_income));
  } else if (tx.type !== undefined) {
    updates.type = tx.type;
  }

  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*, category:categories(*), debt:debts(name)')
    .single();

  if (error) throw error;
  if (!data) throw new Error('Transaction not found');
  return data as Transaction;
}

export async function deleteTransaction(id: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('transactions')
    .select('*, category:categories(*), debt:debts(name)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !data) return null;
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
