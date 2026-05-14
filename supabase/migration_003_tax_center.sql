-- SH Life AI / TxPick — Migration 003: Tax Center
-- Creates W2 employee and 1099 contractor tables used by src/pages/TaxCenter.jsx.
-- Safe to re-run.

create table if not exists public.biz_workers_w2 (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  position text,
  ssn_last4 text,
  wages numeric(12,2) not null default 0,
  fed_withholding numeric(12,2) not null default 0,
  ss_withholding numeric(12,2) not null default 0,
  medicare_withholding numeric(12,2) not null default 0,
  street text,
  city text,
  state text,
  zip text,
  tax_year int not null default extract(year from current_date),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.biz_workers_1099 (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  business_name text,
  tin_last4 text,
  payments numeric(12,2) not null default 0,
  email text,
  phone text,
  street text,
  city text,
  state text,
  zip text,
  tax_year int not null default extract(year from current_date),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.biz_workers_w2
  add column if not exists position text,
  add column if not exists notes text;

alter table public.biz_workers_1099
  add column if not exists business_name text,
  add column if not exists tin_last4 text,
  add column if not exists payments numeric(12,2) not null default 0,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists street text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists zip text,
  add column if not exists tax_year int not null default extract(year from current_date),
  add column if not exists notes text;

create index if not exists biz_workers_w2_user_year_idx on public.biz_workers_w2 (user_id, tax_year);
create index if not exists biz_workers_1099_user_year_idx on public.biz_workers_1099 (user_id, tax_year);

alter table public.biz_workers_w2 enable row level security;
alter table public.biz_workers_1099 enable row level security;

drop policy if exists "w2_own_select" on public.biz_workers_w2;
drop policy if exists "w2_own_insert" on public.biz_workers_w2;
drop policy if exists "w2_own_update" on public.biz_workers_w2;
drop policy if exists "w2_own_delete" on public.biz_workers_w2;
create policy "w2_own_select" on public.biz_workers_w2 for select using (auth.uid() = user_id);
create policy "w2_own_insert" on public.biz_workers_w2 for insert with check (auth.uid() = user_id);
create policy "w2_own_update" on public.biz_workers_w2 for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "w2_own_delete" on public.biz_workers_w2 for delete using (auth.uid() = user_id);

drop policy if exists "contractor_own_select" on public.biz_workers_1099;
drop policy if exists "contractor_own_insert" on public.biz_workers_1099;
drop policy if exists "contractor_own_update" on public.biz_workers_1099;
drop policy if exists "contractor_own_delete" on public.biz_workers_1099;
create policy "contractor_own_select" on public.biz_workers_1099 for select using (auth.uid() = user_id);
create policy "contractor_own_insert" on public.biz_workers_1099 for insert with check (auth.uid() = user_id);
create policy "contractor_own_update" on public.biz_workers_1099 for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "contractor_own_delete" on public.biz_workers_1099 for delete using (auth.uid() = user_id);
