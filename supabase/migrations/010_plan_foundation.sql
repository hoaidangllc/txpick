-- TXPick public beta plan foundation only.
-- No payment provider, no Stripe, no subscription billing yet.

alter table public.profiles
  add column if not exists plan text not null default 'free',
  add column if not exists plan_status text not null default 'active',
  add column if not exists plan_expires_at timestamptz;

alter table public.profiles
  drop constraint if exists profiles_plan_check;

alter table public.profiles
  add constraint profiles_plan_check check (plan in ('free', 'plus', 'pro'));

alter table public.profiles
  drop constraint if exists profiles_plan_status_check;

alter table public.profiles
  add constraint profiles_plan_status_check check (plan_status in ('active', 'inactive', 'trial'));
