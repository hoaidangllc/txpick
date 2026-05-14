-- TxPick — Supabase schema
-- Paste this whole file into the Supabase SQL Editor and click Run.
-- Project: viqqwpbmkqhrpthxlsdc
--
-- What this creates:
--   • profiles               (user metadata + onboarding type + pro flag)
--   • biz_expenses           (Phase 3)
--   • biz_recurring_bills    (Phase 3)
--   • biz_workers_1099       (Phase 3)
--   • personal_bills         (Phase 4)
--   • personal_debts         (Phase 4)
--   • personal_reminders     (Phase 4)
--   • waitlist               (Phase 1)
-- Plus RLS policies, a trigger that auto-creates a profile when a user signs up,
-- and an updated_at trigger.

-- ---------- Extensions ----------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ---------- updated_at helper ----------
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

-- =========================================================
-- profiles
-- =========================================================
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text,
  display_name    text,
  type            text check (type in ('business','personal','both')),
  business_name   text,
  is_pro          boolean not null default false,
  locale          text default 'en',
  onboarded_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- biz_expenses  (Phase 3 — Business)
-- =========================================================
create table if not exists public.biz_expenses (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  amount        numeric(12,2) not null,
  category      text not null check (category in
                   ('supply','utilities','rent','food','equipment','marketing','other')),
  date          date not null default current_date,
  note          text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists biz_expenses_user_date_idx on public.biz_expenses (user_id, date desc);

drop trigger if exists biz_expenses_updated_at on public.biz_expenses;
create trigger biz_expenses_updated_at before update on public.biz_expenses
  for each row execute function public.handle_updated_at();

-- =========================================================
-- biz_recurring_bills  (Phase 3)
-- =========================================================
create table if not exists public.biz_recurring_bills (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  amount        numeric(12,2) not null,
  due_day       int not null check (due_day between 1 and 31),
  category      text not null,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists biz_recurring_bills_user_idx on public.biz_recurring_bills (user_id);

drop trigger if exists biz_recurring_bills_updated_at on public.biz_recurring_bills;
create trigger biz_recurring_bills_updated_at before update on public.biz_recurring_bills
  for each row execute function public.handle_updated_at();

-- =========================================================
-- biz_workers_1099  (Phase 3 / Phase 5)
-- SSN is stored encrypted via pgcrypto; only the last 4 are displayed.
-- =========================================================
create table if not exists public.biz_workers_1099 (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  ssn_last4     text,                        -- shown in UI
  ssn_encrypted bytea,                       -- optional encrypted full SSN
  amount_ytd    numeric(12,2) not null default 0,
  tax_year      int not null default extract(year from current_date),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists biz_workers_1099_user_year_idx
  on public.biz_workers_1099 (user_id, tax_year);

drop trigger if exists biz_workers_1099_updated_at on public.biz_workers_1099;
create trigger biz_workers_1099_updated_at before update on public.biz_workers_1099
  for each row execute function public.handle_updated_at();

-- =========================================================
-- personal_bills  (Phase 4)
-- =========================================================
create table if not exists public.personal_bills (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  type          text not null,               -- mortgage, rent, utilities, internet, car, carIns, health, subscription, other
  amount        numeric(12,2) not null,
  due_day       int not null check (due_day between 1 and 31),
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists personal_bills_user_idx on public.personal_bills (user_id);

drop trigger if exists personal_bills_updated_at on public.personal_bills;
create trigger personal_bills_updated_at before update on public.personal_bills
  for each row execute function public.handle_updated_at();

-- =========================================================
-- personal_debts  (Phase 4)
-- =========================================================
create table if not exists public.personal_debts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  type          text not null,               -- creditCard, personal, student, auto, mortgage, other
  balance       numeric(14,2) not null,
  apr           numeric(5,2) default 0,
  min_payment   numeric(12,2) default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists personal_debts_user_idx on public.personal_debts (user_id);

drop trigger if exists personal_debts_updated_at on public.personal_debts;
create trigger personal_debts_updated_at before update on public.personal_debts
  for each row execute function public.handle_updated_at();

-- =========================================================
-- personal_reminders  (Phase 4)
-- =========================================================
create table if not exists public.personal_reminders (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text not null,
  date          date not null,
  done          boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists personal_reminders_user_date_idx
  on public.personal_reminders (user_id, date);

drop trigger if exists personal_reminders_updated_at on public.personal_reminders;
create trigger personal_reminders_updated_at before update on public.personal_reminders
  for each row execute function public.handle_updated_at();

-- =========================================================
-- waitlist  (Phase 1 — landing page signups)
-- Public can INSERT (so the marketing page can write without auth);
-- only authenticated admins can read.
-- =========================================================
create table if not exists public.waitlist (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  locale        text default 'en',
  source        text,
  created_at    timestamptz not null default now()
);

-- =========================================================
-- Row-Level Security
-- =========================================================
alter table public.profiles             enable row level security;
alter table public.biz_expenses         enable row level security;
alter table public.biz_recurring_bills  enable row level security;
alter table public.biz_workers_1099     enable row level security;
alter table public.personal_bills       enable row level security;
alter table public.personal_debts       enable row level security;
alter table public.personal_reminders   enable row level security;
alter table public.waitlist             enable row level security;

-- A small macro: "user owns the row"
-- We can't actually define macros in plain SQL, but each table gets the same
-- four CRUD policies below.

do $$
declare
  t text;
begin
  for t in select unnest(array[
    'biz_expenses','biz_recurring_bills','biz_workers_1099',
    'personal_bills','personal_debts','personal_reminders'
  ])
  loop
    execute format('drop policy if exists "own_select" on public.%I', t);
    execute format('drop policy if exists "own_insert" on public.%I', t);
    execute format('drop policy if exists "own_update" on public.%I', t);
    execute format('drop policy if exists "own_delete" on public.%I', t);

    execute format('create policy "own_select" on public.%I for select using (auth.uid() = user_id)', t);
    execute format('create policy "own_insert" on public.%I for insert with check (auth.uid() = user_id)', t);
    execute format('create policy "own_update" on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
    execute format('create policy "own_delete" on public.%I for delete using (auth.uid() = user_id)', t);
  end loop;
end $$;

-- profiles: a user can see/update only their own profile
drop policy if exists "profile_select_own" on public.profiles;
drop policy if exists "profile_update_own" on public.profiles;
drop policy if exists "profile_insert_own" on public.profiles;
create policy "profile_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profile_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profile_insert_own" on public.profiles for insert with check (auth.uid() = id);

-- waitlist: anyone (anon role) can INSERT; nobody can SELECT/UPDATE/DELETE without service_role
drop policy if exists "waitlist_anon_insert" on public.waitlist;
create policy "waitlist_anon_insert" on public.waitlist
  for insert to anon, authenticated with check (true);

-- =========================================================
-- Done
-- =========================================================
-- Optional sanity check: list created tables
-- select tablename from pg_tables where schemaname='public' order by tablename;
