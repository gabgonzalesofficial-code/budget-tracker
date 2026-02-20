-- Debt types for AI readiness (warnings, optimal payment focus)
do $$ begin
  create type debt_type_enum as enum ('loan', 'credit_card', 'personal');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type debt_type_enum not null default 'personal',
  total_amount decimal(12,2) not null check (total_amount >= 0),
  remaining_balance decimal(12,2) not null check (remaining_balance >= 0),
  interest_rate decimal(5,2),
  due_date date,
  created_at timestamptz default now()
);

alter table public.debts enable row level security;

drop policy if exists "Users can manage own debts" on public.debts;
create policy "Users can manage own debts"
  on public.debts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists debts_user_idx on public.debts(user_id);

-- Debt Payment category for transaction linkage
insert into public.categories (name, type, color, icon_name) values
  ('Debt Payment', 'expense', '#DC2626', 'CreditCard')
on conflict (name, type) do nothing;

-- Add debt_id to transactions, extend type for debt_payment
alter table public.transactions add column if not exists debt_id uuid references public.debts(id) on delete set null;

-- Extend transaction type for debt_payment (PostgreSQL may auto-name the constraint)
alter table public.transactions drop constraint if exists transactions_type_check;
alter table public.transactions add constraint transactions_type_check
  check (type in ('expense', 'income', 'other_revenue', 'debt_payment'));
