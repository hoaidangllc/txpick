-- Profit Split full safe migration
-- Run this in Supabase SQL Editor. Safe to run multiple times.

create table if not exists profit_split_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  base_rate numeric(18,4) not null default 0,
  selling_rate numeric(18,4) not null default 0,
  partner_percent numeric(7,4) not null default 0,
  commission_percent numeric(7,4) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists profit_split_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  profile_id uuid references profit_split_profiles(id) on delete set null,
  profile_name text,
  quantity numeric(18,4) not null default 0,
  gross_revenue numeric(18,4) not null default 0,
  base_cost numeric(18,4) not null default 0,
  partner_share numeric(18,4) not null default 0,
  commission_share numeric(18,4) not null default 0,
  my_share_percent numeric(7,4) not null default 0,
  my_gross_share numeric(18,4) not null default 0,
  net_profit numeric(18,4) not null default 0,
  currency varchar(3) not null default 'VND',
  created_at timestamptz not null default now()
);

-- Make older/incomplete tables match the current app.
alter table profit_split_profiles
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists name text,
  add column if not exists base_rate numeric(18,4) not null default 0,
  add column if not exists selling_rate numeric(18,4) not null default 0,
  add column if not exists partner_percent numeric(7,4) not null default 0,
  add column if not exists commission_percent numeric(7,4) not null default 0,
  add column if not exists active boolean not null default true,
  add column if not exists created_at timestamptz not null default now();

alter table profit_split_history
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists profile_id uuid references profit_split_profiles(id) on delete set null,
  add column if not exists profile_name text,
  add column if not exists quantity numeric(18,4) not null default 0,
  add column if not exists gross_revenue numeric(18,4) not null default 0,
  add column if not exists base_cost numeric(18,4) not null default 0,
  add column if not exists partner_share numeric(18,4) not null default 0,
  add column if not exists commission_share numeric(18,4) not null default 0,
  add column if not exists my_share_percent numeric(7,4) not null default 0,
  add column if not exists my_gross_share numeric(18,4) not null default 0,
  add column if not exists net_profit numeric(18,4) not null default 0,
  add column if not exists currency varchar(3) not null default 'VND',
  add column if not exists created_at timestamptz not null default now();

alter table profit_split_profiles enable row level security;
alter table profit_split_history enable row level security;

drop policy if exists "Users manage own profiles" on profit_split_profiles;
drop policy if exists "Users manage own history" on profit_split_history;

create policy "Users manage own profiles"
  on profit_split_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own history"
  on profit_split_history for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists profit_split_profiles_user_id on profit_split_profiles(user_id);
create index if not exists profit_split_history_user_id on profit_split_history(user_id);
create index if not exists profit_split_history_profile_id on profit_split_history(profile_id);
create index if not exists profit_split_history_created_at on profit_split_history(created_at desc);
