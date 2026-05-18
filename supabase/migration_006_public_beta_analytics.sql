-- TXPick Public Beta Pack 5: lightweight analytics foundation
-- Safe to run after existing profile/auth migrations. This does not affect core reminders/bills/expenses flows.

create table if not exists public.app_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid null references public.profiles(id) on delete cascade,
  event_name text not null,
  payload jsonb not null default '{}'::jsonb,
  page_path text null,
  created_at timestamptz not null default now()
);

create index if not exists app_events_profile_created_idx on public.app_events(profile_id, created_at desc);
create index if not exists app_events_name_created_idx on public.app_events(event_name, created_at desc);

alter table public.app_events enable row level security;

drop policy if exists app_events_own_insert on public.app_events;
create policy app_events_own_insert
on public.app_events
for insert
with check (profile_id is null or profile_id = auth.uid());

drop policy if exists app_events_own_select on public.app_events;
create policy app_events_own_select
on public.app_events
for select
using (profile_id = auth.uid());

comment on table public.app_events is 'Lightweight public beta analytics: app opens, onboarding, quick-add, pricing clicks, and retention events. No PII should be stored in payload.';
