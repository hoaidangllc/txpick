-- Production RLS foundation for TxPick Life Assistant
-- Safe to run repeatedly. It drops/recreates only these app-owned policies.

alter table public.profiles enable row level security;
alter table public.reminders enable row level security;
alter table public.bills enable row level security;
alter table public.expenses enable row level security;
alter table public.daily_summaries enable row level security;

drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
drop policy if exists reminders_crud_own on public.reminders;
drop policy if exists bills_crud_own on public.bills;
drop policy if exists expenses_crud_own on public.expenses;
drop policy if exists daily_summaries_crud_own on public.daily_summaries;

create policy profiles_select_own
on public.profiles for select
to authenticated
using (id = auth.uid());

create policy profiles_insert_own
on public.profiles for insert
to authenticated
with check (id = auth.uid());

create policy profiles_update_own
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy reminders_crud_own
on public.reminders for all
to authenticated
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

create policy bills_crud_own
on public.bills for all
to authenticated
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

create policy expenses_crud_own
on public.expenses for all
to authenticated
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

create policy daily_summaries_crud_own
on public.daily_summaries for all
to authenticated
using (profile_id = auth.uid())
with check (profile_id = auth.uid());
