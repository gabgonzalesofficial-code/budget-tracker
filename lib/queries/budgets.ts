import { createClient } from '@/lib/supabase/client';
import type { Budget, CategorySpending } from '@/lib/types';

export async function listBudgets(month: number, year: number): Promise<Budget[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('budgets')
    .select('*, category:categories(*)')
    .eq('user_id', user.id)
    .eq('month', month)
    .eq('year', year)
    .order('amount', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Budget[];
}

export async function getCategorySpending(
  month: number,
  year: number
): Promise<CategorySpending[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const [budgetsRes, spendingRes] = await Promise.all([
    supabase
      .from('budgets')
      .select('*, category:categories(*)')
      .eq('user_id', user.id)
      .eq('month', month)
      .eq('year', year),
    supabase
      .from('transactions')
      .select('category_id, amount')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .gte('date', `${year}-${String(month).padStart(2, '0')}-01`)
      .lt('date', month === 12
        ? `${year + 1}-01-01`
        : `${year}-${String(month + 1).padStart(2, '0')}-01`),
  ]);

  if (budgetsRes.error) throw budgetsRes.error;
  if (spendingRes.error) throw spendingRes.error;

  const spentByCategory: Record<string, number> = {};
  for (const row of spendingRes.data ?? []) {
    const id = row.category_id;
    spentByCategory[id] = (spentByCategory[id] ?? 0) + Number(row.amount);
  }

  return (budgetsRes.data ?? []).map((b) => {
    const cat = b.category as { id: string; name: string; color?: string; icon_name?: string } | null;
    const spent = spentByCategory[b.category_id] ?? 0;
    return {
      category_id: b.category_id,
      category_name: cat?.name ?? 'Unknown',
      amount: spent,
      budget: Number(b.amount),
      color: cat?.color,
      icon_name: cat?.icon_name,
    };
  });
}

export async function upsertBudget(
  categoryId: string,
  amount: number,
  month: number,
  year: number
): Promise<Budget> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('budgets')
    .upsert(
      {
        user_id: user.id,
        category_id: categoryId,
        amount,
        month,
        year,
      },
      { onConflict: 'user_id,category_id,month,year' }
    )
    .select('*, category:categories(*)')
    .single();

  if (error) throw error;
  return data as Budget;
}

export async function deleteBudget(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('budgets').delete().eq('id', id);
  if (error) throw error;
}
