-- TXPick RLS/security hardening pass.
-- Safe to run after the base tables exist. This file avoids touching old sportsbook tables.

-- Helper note:
-- Frontend queries also filter by user id, but RLS is the real safety layer.
-- Every personal/business table below must only expose rows owned by auth.uid().

alter table if exists public.profiles enable row level security;
alter table if exists public.reminders enable row level security;
alter table if exists public.bills enable row level security;
alter table if exists public.expenses enable row level security;
alter table if exists public.daily_summaries enable row level security;
alter table if exists public.feedback_requests enable row level security;
alter table if exists public.push_subscriptions enable row level security;
alter table if exists public.push_notification_logs enable row level security;
alter table if exists public.biz_workers_1099 enable row level security;
alter table if exists public.biz_workers_w2 enable row level security;
alter table if exists public.biz_income_records enable row level security;
alter table if exists public.biz_expenses enable row level security;
alter table if exists public.biz_recurring_bills enable row level security;

-- Profiles: users can read/update only themselves. Inserts/upserts are also limited to self.
do $$ begin
  if to_regclass('public.profiles') is not null then
    execute 'drop policy if exists "profiles_own_select" on public.profiles';
    execute 'create policy "profiles_own_select" on public.profiles for select using (auth.uid() = id)';
    execute 'drop policy if exists "profiles_own_insert" on public.profiles';
    execute 'create policy "profiles_own_insert" on public.profiles for insert with check (auth.uid() = id)';
    execute 'drop policy if exists "profiles_own_update" on public.profiles';
    execute 'create policy "profiles_own_update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id)';
  end if;
end $$;

-- Tables with profile_id ownership.
do $$
declare t text;
begin
  foreach t in array array['reminders','bills','expenses','daily_summaries','feedback_requests','push_subscriptions','push_notification_logs'] loop
    if to_regclass('public.' || t) is not null then
      execute format('drop policy if exists %I on public.%I', t || '_own_select', t);
      execute format('create policy %I on public.%I for select using (auth.uid() = profile_id)', t || '_own_select', t);

      if t not in ('push_notification_logs') then
        execute format('drop policy if exists %I on public.%I', t || '_own_insert', t);
        execute format('create policy %I on public.%I for insert with check (auth.uid() = profile_id)', t || '_own_insert', t);
      end if;

      if t not in ('push_notification_logs') then
        execute format('drop policy if exists %I on public.%I', t || '_own_update', t);
        execute format('create policy %I on public.%I for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id)', t || '_own_update', t);
      end if;

      execute format('drop policy if exists %I on public.%I', t || '_own_delete', t);
      execute format('create policy %I on public.%I for delete using (auth.uid() = profile_id)', t || '_own_delete', t);
    end if;
  end loop;
end $$;

-- Business tax tables with user_id ownership.
do $$
declare t text;
begin
  foreach t in array array['biz_workers_1099','biz_workers_w2','biz_income_records','biz_expenses','biz_recurring_bills'] loop
    if to_regclass('public.' || t) is not null then
      execute format('drop policy if exists %I on public.%I', t || '_own_select', t);
      execute format('create policy %I on public.%I for select using (auth.uid() = user_id)', t || '_own_select', t);
      execute format('drop policy if exists %I on public.%I', t || '_own_insert', t);
      execute format('create policy %I on public.%I for insert with check (auth.uid() = user_id)', t || '_own_insert', t);
      execute format('drop policy if exists %I on public.%I', t || '_own_update', t);
      execute format('create policy %I on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)', t || '_own_update', t);
      execute format('drop policy if exists %I on public.%I', t || '_own_delete', t);
      execute format('create policy %I on public.%I for delete using (auth.uid() = user_id)', t || '_own_delete', t);
    end if;
  end loop;
end $$;

-- Important: service role keys must remain server-only. Do not expose SUPABASE_SERVICE_ROLE_KEY,
-- OPENAI_API_KEY, RESEND_API_KEY, or push private keys in any VITE_* variable.
