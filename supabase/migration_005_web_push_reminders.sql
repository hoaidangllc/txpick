-- TX Life: true background Web Push reminders
-- Run this once in Supabase SQL Editor before enabling push in production.

create extension if not exists "pgcrypto";

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  enabled boolean not null default true,
  last_sent_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists push_subscriptions_profile_idx
  on public.push_subscriptions(profile_id)
  where enabled = true;

create table if not exists public.push_notification_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  reminder_id uuid references public.reminders(id) on delete set null,
  dedupe_key text not null unique,
  channel text not null default 'web_push',
  status text not null default 'sent',
  delivered_count int not null default 0,
  error text,
  created_at timestamptz not null default now()
);

create index if not exists push_notification_logs_profile_created_idx
  on public.push_notification_logs(profile_id, created_at desc);

alter table public.push_subscriptions enable row level security;
alter table public.push_notification_logs enable row level security;

drop policy if exists push_subscriptions_select_own on public.push_subscriptions;
drop policy if exists push_subscriptions_insert_own on public.push_subscriptions;
drop policy if exists push_subscriptions_update_own on public.push_subscriptions;
drop policy if exists push_subscriptions_delete_own on public.push_subscriptions;
drop policy if exists push_notification_logs_select_own on public.push_notification_logs;

create policy push_subscriptions_select_own
on public.push_subscriptions for select
to authenticated
using (profile_id = auth.uid());

create policy push_subscriptions_insert_own
on public.push_subscriptions for insert
to authenticated
with check (profile_id = auth.uid());

create policy push_subscriptions_update_own
on public.push_subscriptions for update
to authenticated
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

create policy push_subscriptions_delete_own
on public.push_subscriptions for delete
to authenticated
using (profile_id = auth.uid());

create policy push_notification_logs_select_own
on public.push_notification_logs for select
to authenticated
using (profile_id = auth.uid());
