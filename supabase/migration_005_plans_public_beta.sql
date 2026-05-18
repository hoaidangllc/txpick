-- TXPick public beta plan foundation.
-- Safe to run once. No payment/Stripe logic is enabled here.

alter table if exists profiles
  add column if not exists plan_key text not null default 'free',
  add column if not exists plan_status text not null default 'active',
  add column if not exists plan_expires_at timestamptz,
  add column if not exists assistant_used_today integer not null default 0,
  add column if not exists assistant_usage_date date default current_date;

alter table if exists profiles
  add constraint profiles_plan_key_check check (plan_key in ('free', 'plus', 'pro')) not valid;

alter table if exists profiles
  add constraint profiles_plan_status_check check (plan_status in ('active', 'inactive', 'trial', 'past_due')) not valid;

create index if not exists profiles_plan_key_idx on profiles(plan_key);
