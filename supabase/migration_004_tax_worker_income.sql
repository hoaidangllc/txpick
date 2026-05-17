-- TXPick / TXPick — Tax Center foundation
-- Run this once in Supabase SQL editor if the Tax Center page reports missing tables.

create table if not exists public.biz_workers_1099 (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  tin text,
  tin_text text,
  tin_last4 text,
  address text,
  street text,
  city text,
  state text,
  zip text,
  work_pay numeric(12,2) not null default 0,
  tips numeric(12,2) not null default 0,
  payments numeric(12,2) not null default 0,
  total_pay numeric(12,2) not null default 0,
  tax_year integer not null default extract(year from now())::integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.biz_workers_w2 (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  ssn text,
  ssn_text text,
  ssn_last4 text,
  address text,
  street text,
  city text,
  state text,
  zip text,
  work_pay numeric(12,2) not null default 0,
  tips numeric(12,2) not null default 0,
  wages numeric(12,2) not null default 0,
  total_pay numeric(12,2) not null default 0,
  tax_year integer not null default extract(year from now())::integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.biz_income_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null,
  category text not null default 'salon_income',
  amount numeric(12,2) not null default 0,
  record_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists biz_workers_1099_user_year_idx on public.biz_workers_1099(user_id, tax_year, created_at desc);
create index if not exists biz_workers_w2_user_year_idx on public.biz_workers_w2(user_id, tax_year, created_at desc);
create index if not exists biz_income_records_user_date_idx on public.biz_income_records(user_id, record_date desc);

alter table public.biz_workers_1099 enable row level security;
alter table public.biz_workers_w2 enable row level security;
alter table public.biz_income_records enable row level security;

drop policy if exists "Users manage own 1099 workers" on public.biz_workers_1099;
create policy "Users manage own 1099 workers"
  on public.biz_workers_1099 for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage own W2 workers" on public.biz_workers_w2;
create policy "Users manage own W2 workers"
  on public.biz_workers_w2 for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage own business income" on public.biz_income_records;
create policy "Users manage own business income"
  on public.biz_income_records for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Optional compatibility columns for older expenses tables.
alter table public.expenses add column if not exists expense_type text;
alter table public.expenses add column if not exists tax_category text;

-- Workspace/profile support for separate Personal vs Business mode.
alter table public.profiles add column if not exists type text default 'personal';
alter table public.profiles add column if not exists business_name text;
alter table public.profiles add column if not exists onboarded_at timestamptz;

-- Business expense compatibility fields used by Business Tax Center.
alter table public.expenses add column if not exists recurring boolean not null default false;
alter table public.expenses add column if not exists recurring_pattern text not null default 'none';
create index if not exists expenses_profile_business_date_idx
  on public.expenses(profile_id, expense_type, expense_date desc);
