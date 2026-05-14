-- SH Life AI / TxPick — Migration 004: real salon/business tax workflow
-- Adds worker pay/tips fields and business income records for year-end tax export.
-- Safe to re-run.

alter table public.biz_workers_w2
  add column if not exists ssn text,
  add column if not exists ssn_text text,
  add column if not exists address text,
  add column if not exists work_pay numeric(12,2) not null default 0,
  add column if not exists tips numeric(12,2) not null default 0,
  add column if not exists total_pay numeric(12,2) not null default 0;

alter table public.biz_workers_1099
  add column if not exists tin text,
  add column if not exists tin_text text,
  add column if not exists address text,
  add column if not exists work_pay numeric(12,2) not null default 0,
  add column if not exists tips numeric(12,2) not null default 0,
  add column if not exists total_pay numeric(12,2) not null default 0;

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

create index if not exists biz_income_records_user_date_idx on public.biz_income_records (user_id, record_date);

alter table public.biz_income_records enable row level security;

drop policy if exists "income_own_select" on public.biz_income_records;
drop policy if exists "income_own_insert" on public.biz_income_records;
drop policy if exists "income_own_update" on public.biz_income_records;
drop policy if exists "income_own_delete" on public.biz_income_records;

create policy "income_own_select" on public.biz_income_records for select using (auth.uid() = user_id);
create policy "income_own_insert" on public.biz_income_records for insert with check (auth.uid() = user_id);
create policy "income_own_update" on public.biz_income_records for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "income_own_delete" on public.biz_income_records for delete using (auth.uid() = user_id);
