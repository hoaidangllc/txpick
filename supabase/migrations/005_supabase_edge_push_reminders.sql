-- TX Life Web Push reminder foundation.
-- Vercel hosts the PWA only. Supabase runs the reminder scheduler.

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references auth.users(id) on delete cascade,
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

create index if not exists push_subscriptions_profile_enabled_idx
  on public.push_subscriptions(profile_id, enabled);

create table if not exists public.push_notification_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references auth.users(id) on delete cascade,
  reminder_id uuid,
  dedupe_key text not null unique,
  channel text not null default 'web_push',
  status text not null default 'sent',
  delivered_count integer not null default 0,
  error text,
  created_at timestamptz not null default now()
);

create index if not exists push_notification_logs_profile_created_idx
  on public.push_notification_logs(profile_id, created_at desc);

create index if not exists push_notification_logs_reminder_idx
  on public.push_notification_logs(reminder_id);

create index if not exists reminders_due_active_idx
  on public.reminders(due_at, completed, profile_id)
  where completed = false;

alter table public.push_subscriptions enable row level security;
alter table public.push_notification_logs enable row level security;

drop policy if exists "Users can view their push subscriptions" on public.push_subscriptions;
create policy "Users can view their push subscriptions"
  on public.push_subscriptions for select
  using (auth.uid() = profile_id);

drop policy if exists "Users can delete their push subscriptions" on public.push_subscriptions;
create policy "Users can delete their push subscriptions"
  on public.push_subscriptions for delete
  using (auth.uid() = profile_id);

-- Insert/update is handled by API/Edge code using the service role so raw p256dh/auth keys
-- are not directly writable by untrusted clients.

drop policy if exists "Users can view their push logs" on public.push_notification_logs;
create policy "Users can view their push logs"
  on public.push_notification_logs for select
  using (auth.uid() = profile_id);

-- Schedule setup is intentionally left as a manual block because each Supabase project URL differs.
-- After deploying the Edge Function, replace YOUR_PROJECT_REF and YOUR_CRON_SECRET, then run:
--
-- select cron.unschedule('txlife-send-reminders-every-5-minutes'); -- optional if replacing old schedule
-- select cron.schedule(
--   'txlife-send-reminders-every-5-minutes',
--   '*/5 * * * *',
--   $$
--   select
--     net.http_post(
--       url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-reminders',
--       headers := jsonb_build_object(
--         'Content-Type', 'application/json',
--         'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key', true),
--         'x-cron-secret', 'YOUR_CRON_SECRET'
--       ),
--       body := jsonb_build_object('source', 'pg_cron')
--     );
--   $$
-- );
--
-- Safer option for the service role key: create a Supabase Vault secret or use the dashboard scheduler
-- so the key is not pasted into application tables. The Edge Function also accepts CRON_SECRET only
-- if you choose to call it from a trusted external cron.
