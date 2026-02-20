import { createClient } from '@/lib/supabase/client';
import type { Category } from '@/lib/types';

export async function getCategories(type?: 'expense' | 'income' | 'other_revenue'): Promise<Category[]> {
  const supabase = createClient();
  let query = supabase.from('categories').select('*').order('name');

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Category[];
}
