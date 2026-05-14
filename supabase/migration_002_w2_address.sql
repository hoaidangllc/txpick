-- TxPick — Migration 002
-- Adds address columns to biz_workers_1099 and creates biz_workers_w2.
-- Run AFTER schema.sql (idempotent — safe to re-run).
-- Paste into the Supabase SQL editor and click Run.

-- ---------- 1099: add address columns ----------
alter table public.biz_workers_1099
  add column if not exists street text,
  add column if not exists city   text,
  add column if not exists state  text,
  add column if not exists zip    text;

-- ---------- W-2 employees ----------
create table if not exists public.biz_workers_w2 (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references auth.users(id) on delete cascade,
  name                   text not null,
  ssn_last4              text,
  ssn_encrypted          bytea,
  wages                  numeric(12,2) not null default 0,
  fed_withholding        numeric(12,2) not null default 0,
  ss_withholding         numeric(12,2) not null default 0,
  medicare_withholding   numeric(12,2) not null default 0,
  street                 text,
  city                   text,
  state                  text,
  zip                    text,
  tax_year               int not null default extract(year from current_date),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index if not exists biz_workers_w2_user_year_idx on public.biz_workers_w2 (user_id, tax_year);

drop trigger if exists biz_workers_w2_updated_at on public.biz_workers_w2;
create trigger biz_workers_w2_updated_at before update on public.biz_workers_w2
  for each row execute function public.handle_updated_at();

-- ---------- Business info per user (used as Payer / Employer on tax forms) ----------
create table if not exists public.business_info (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  name        text,
  ein         text,
  street      text,
  city        text,
  state       text,
  zip         text,
  updated_at  timestamptz not null default now()
);

drop trigger if exists business_info_updated_at on public.business_info;
create trigger business_info_updated_at before update on public.business_info
  for each row execute function public.handle_updated_at();

-- ---------- RLS ----------
alter table public.biz_workers_w2 enable row level security;
alter table public.business_info  enable row level security;

drop policy if exists "w2_own_select" on public.biz_workers_w2;
drop policy if exists "w2_own_insert" on public.biz_workers_w2;
drop policy if exists "w2_own_update" on public.biz_workers_w2;
drop policy if exists "w2_own_delete" on public.biz_workers_w2;
create policy "w2_own_select" on public.biz_workers_w2 for select using (auth.uid() = user_id);
create policy "w2_own_insert" on public.biz_workers_w2 for insert with check (auth.uid() = user_id);
create policy "w2_own_update" on public.biz_workers_w2 for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "w2_own_delete" on public.biz_workers_w2 for delete using (auth.uid() = user_id);

drop policy if exists "biz_info_own_select" on public.business_info;
drop policy if exists "biz_info_own_upsert" on public.business_info;
drop policy if exists "biz_info_own_update" on public.business_info;
drop policy if exists "biz_info_own_delete" on public.business_info;
create policy "biz_info_own_select" on public.business_info for select using (auth.uid() = user_id);
create policy "biz_info_own_upsert" on public.business_info for insert with check (auth.uid() = user_id);
create policy "biz_info_own_update" on public.business_info for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "biz_info_own_delete" on public.business_info for delete using (auth.uid() = user_id);

-- Done. Sanity check:
-- select column_name from information_schema.columns where table_name='biz_workers_1099';
-- select column_name from information_schema.columns where table_name='biz_workers_w2';
