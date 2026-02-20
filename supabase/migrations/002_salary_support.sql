-- Add force_income to categories: when true, transaction type is always income
alter table public.categories add column if not exists force_income boolean default false;

-- Mark Salary as force_income (data-driven, not hard-coded in app logic)
update public.categories set force_income = true where name = 'Salary' and type = 'income';

-- Optional: recurring schedule for bi-monthly salary
alter table public.transactions add column if not exists recurring_schedule text check (recurring_schedule is null or recurring_schedule = 'bi-monthly');
