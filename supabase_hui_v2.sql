-- Hui v2 migration — run in Supabase SQL Editor AFTER supabase_hui.sql

-- Alter existing tables
alter table hui_groups
  add column if not exists estimated_end_date date,
  add column if not exists status text not null default 'active'; -- active | completed | cancelled

alter table hui_members
  add column if not exists has_received_payout boolean not null default false,
  add column if not exists payout_round int,
  add column if not exists payout_date date;

-- New payments table
create table if not exists hui_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  group_id uuid references hui_groups(id) on delete cascade not null,
  round_number int not null,
  member_id uuid references hui_members(id) on delete cascade not null,
  member_name text,
  amount_due numeric(18,4) not null default 0,
  amount_paid numeric(18,4) not null default 0,
  paid_date date,
  status text not null default 'unpaid', -- unpaid | partial | paid
  created_at timestamptz not null default now()
);

alter table hui_payments enable row level security;

create policy "Users manage own hui_payments"
  on hui_payments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists hui_payments_group_round on hui_payments(group_id, round_number);
create index if not exists hui_payments_member_id on hui_payments(member_id);
