import { createClient } from '@/lib/supabase/client';
import type { Debt, DebtType } from '@/lib/types';

export async function listDebts(): Promise<Debt[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('debts')
    .select('*')
    .eq('user_id', user.id)
    .gt('remaining_balance', 0)
    .order('remaining_balance', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((d) => ({
    ...d,
    total_amount: Number(d.total_amount),
    remaining_balance: Number(d.remaining_balance),
    interest_rate: d.interest_rate != null ? Number(d.interest_rate) : null,
  })) as Debt[];
}

export async function listAllDebts(): Promise<Debt[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('debts')
    .select('*')
    .eq('user_id', user.id)
    .order('remaining_balance', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((d) => ({
    ...d,
    total_amount: Number(d.total_amount),
    remaining_balance: Number(d.remaining_balance),
    interest_rate: d.interest_rate != null ? Number(d.interest_rate) : null,
  })) as Debt[];
}

export async function createDebt(debt: {
  name: string;
  type: DebtType;
  total_amount: number;
  remaining_balance: number;
  interest_rate?: number | null;
  due_date?: string | null;
}): Promise<Debt> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const remaining = Math.max(0, debt.remaining_balance);
  const total = Math.max(remaining, debt.total_amount);

  const { data, error } = await supabase
    .from('debts')
    .insert({
      user_id: user.id,
      name: debt.name,
      type: debt.type,
      total_amount: total,
      remaining_balance: remaining,
      interest_rate: debt.interest_rate ?? null,
      due_date: debt.due_date ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return { ...data, total_amount: Number(data.total_amount), remaining_balance: Number(data.remaining_balance) } as Debt;
}

export async function getDebtById(id: string): Promise<Debt | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('debts')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !data) return null;
  return {
    ...data,
    total_amount: Number(data.total_amount),
    remaining_balance: Number(data.remaining_balance),
    interest_rate: data.interest_rate != null ? Number(data.interest_rate) : null,
  } as Debt;
}

export async function updateDebt(id: string, debt: {
  name?: string;
  type?: DebtType;
  total_amount?: number;
  remaining_balance?: number;
  interest_rate?: number | null;
  due_date?: string | null;
}): Promise<Debt> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const updates: Record<string, unknown> = {};
  if (debt.name !== undefined) updates.name = debt.name;
  if (debt.type !== undefined) updates.type = debt.type;
  if (debt.total_amount !== undefined) updates.total_amount = debt.total_amount;
  if (debt.remaining_balance !== undefined) updates.remaining_balance = Math.max(0, debt.remaining_balance);
  if (debt.interest_rate !== undefined) updates.interest_rate = debt.interest_rate;
  if (debt.due_date !== undefined) updates.due_date = debt.due_date;

  if (Object.keys(updates).length === 0) {
    const d = await getDebtById(id);
    if (!d) throw new Error('Debt not found');
    return d;
  }

  if (updates.remaining_balance !== undefined && updates.total_amount !== undefined) {
    const remaining = Number(updates.remaining_balance);
    const total = Number(updates.total_amount);
    if (remaining > total) throw new Error('Remaining balance cannot exceed total amount');
  }

  const { data, error } = await supabase
    .from('debts')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Debt not found');
  return { ...data, total_amount: Number(data.total_amount), remaining_balance: Number(data.remaining_balance) } as Debt;
}

export async function deleteDebt(id: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('debts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function payDebt(
  debtId: string,
  amount: number,
  date: string,
  notes?: string | null
): Promise<{ debt: Debt; transaction: { id: string } }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: debt, error: debtError } = await supabase
    .from('debts')
    .select('*')
    .eq('id', debtId)
    .eq('user_id', user.id)
    .single();

  if (debtError || !debt) throw new Error('Debt not found');
  const remaining = Number(debt.remaining_balance);
  if (amount <= 0) throw new Error('Payment amount must be positive');
  if (amount > remaining) throw new Error(`Payment cannot exceed remaining balance (₱${remaining.toLocaleString()})`);

  const newBalance = remaining - amount;
  const debtPaymentCategory = await supabase
    .from('categories')
    .select('id')
    .eq('name', 'Debt Payment')
    .eq('type', 'expense')
    .single();

  if (debtPaymentCategory.error || !debtPaymentCategory.data) {
    throw new Error('Debt Payment category not found. Run migrations.');
  }

  const { error: updateError } = await supabase
    .from('debts')
    .update({ remaining_balance: Math.max(0, newBalance) })
    .eq('id', debtId)
    .eq('user_id', user.id);

  if (updateError) throw updateError;

  const { data: tx, error: txError } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      amount,
      type: 'debt_payment',
      category_id: debtPaymentCategory.data.id,
      debt_id: debtId,
      description: `Payment: ${debt.name}`,
      date,
      notes: notes ?? null,
    })
    .select('id')
    .single();

  if (txError) throw txError;
  const updatedDebt = await supabase.from('debts').select('*').eq('id', debtId).single();
  return {
    debt: {
      ...updatedDebt.data,
      total_amount: Number(updatedDebt.data?.total_amount),
      remaining_balance: Number(updatedDebt.data?.remaining_balance),
    } as Debt,
    transaction: { id: tx.id },
  };
}
