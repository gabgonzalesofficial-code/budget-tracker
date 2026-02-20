-- Categories: seeded data for expense, income, other_revenue
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('expense', 'income', 'other_revenue')),
  color text,
  icon_name text,
  created_at timestamptz default now(),
  unique(name, type)
);

-- Enable RLS
alter table public.categories enable row level security;

drop policy if exists "Categories are readable by everyone" on public.categories;
create policy "Categories are readable by everyone"
  on public.categories for select
  using (true);

-- Transactions
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount decimal(12,2) not null,
  type text not null check (type in ('expense', 'income', 'other_revenue')),
  category_id uuid not null references public.categories(id) on delete restrict,
  description text,
  date date not null,
  notes text,
  created_at timestamptz default now()
);

alter table public.transactions enable row level security;

drop policy if exists "Users can manage own transactions" on public.transactions;
create policy "Users can manage own transactions"
  on public.transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists transactions_user_date_idx on public.transactions(user_id, date desc);

-- Budgets
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  amount decimal(12,2) not null check (amount >= 0),
  month int not null check (month >= 1 and month <= 12),
  year int not null,
  created_at timestamptz default now(),
  unique(user_id, category_id, month, year)
);

alter table public.budgets enable row level security;

drop policy if exists "Users can manage own budgets" on public.budgets;
create policy "Users can manage own budgets"
  on public.budgets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Seed default categories (idempotent via insert ... on conflict)
insert into public.categories (name, type, color, icon_name) values
  ('Food & Dining', 'expense', '#EF4444', 'Utensils'),
  ('Transport', 'expense', '#F59E0B', 'Car'),
  ('Shopping', 'expense', '#059669', 'ShoppingBag'),
  ('Housing', 'expense', '#3B82F6', 'Home'),
  ('Entertainment', 'expense', '#EC4899', 'Coffee'),
  ('Utilities', 'expense', '#10B981', 'Lightbulb'),
  ('Healthcare', 'expense', '#EF4444', 'Heart'),
  ('Education', 'expense', '#059669', 'GraduationCap'),
  ('Other', 'expense', '#6B7280', 'Tag'),
  ('Salary', 'income', '#10B981', 'TrendingUp'),
  ('Bonus', 'income', '#10B981', 'TrendingUp'),
  ('Investment', 'income', '#10B981', 'TrendingUp'),
  ('Gift', 'income', '#10B981', 'TrendingUp'),
  ('Other', 'income', '#10B981', 'TrendingUp'),
  ('Freelance', 'other_revenue', '#059669', 'DollarSign'),
  ('Side Business', 'other_revenue', '#059669', 'DollarSign'),
  ('Rental Income', 'other_revenue', '#059669', 'DollarSign'),
  ('Dividend', 'other_revenue', '#059669', 'DollarSign'),
  ('Refund', 'other_revenue', '#059669', 'DollarSign'),
  ('Other', 'other_revenue', '#059669', 'DollarSign')
on conflict (name, type) do nothing;
