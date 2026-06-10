-- Profit Split Addon: Migration
-- Run this in Supabase SQL Editor

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
  quantity numeric(18,4) not null,
  gross_revenue numeric(18,4) not null,
  base_cost numeric(18,4) not null,
  partner_share numeric(18,4) not null,
  commission_share numeric(18,4) not null,
  net_profit numeric(18,4) not null,
  currency varchar(3) not null default 'VND',
  created_at timestamptz not null default now()
);

-- RLS
alter table profit_split_profiles enable row level security;
alter table profit_split_history enable row level security;

create policy "Users manage own profiles"
  on profit_split_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own history"
  on profit_split_history for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Indexes
create index if not exists profit_split_profiles_user_id on profit_split_profiles(user_id);
create index if not exists profit_split_history_user_id on profit_split_history(user_id);
create index if not exists profit_split_history_created_at on profit_split_history(created_at desc);
