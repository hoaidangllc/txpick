-- TXPick reminder production audit + permanent pg_cron fix
-- Run in Supabase SQL Editor.
-- Replace YOUR_CRON_SECRET with the exact same value as Vercel CRON_SECRET.

-- 1) Confirm pg_cron job exists and active
select jobid, jobname, schedule, active, command
from cron.job
where jobname ilike '%txpick%reminder%' or command ilike '%send-reminders%'
order by jobid desc;

-- 2) Confirm pg_net responses from recent cron calls
-- status_code 200 = endpoint accepted job.
-- 401 = auth/header mismatch.
-- 404/405/500 = endpoint/path/server issue.
select id, status_code, content_type, created, timed_out, error_msg,
       left(content::text, 500) as body_preview
from net._http_response
where created > now() - interval '2 hours'
order by created desc
limit 50;

-- 3) Confirm due reminders around now, using DB time
select now() as supabase_now_utc;

select id, profile_id, title, due_at, repeat_pattern, completed,
       now() - due_at as age
from public.reminders
where completed = false
  and due_at <= now()
  and due_at >= now() - interval '30 minutes'
order by due_at desc
limit 50;

-- 4) Confirm active push subscriptions for recent due reminders
select ps.profile_id,
       count(*) filter (where ps.enabled) as enabled_count,
       count(*) as total_count,
       max(ps.last_sent_at) as last_sent_at,
       max(ps.updated_at) as last_updated_at,
       string_agg(distinct coalesce(ps.last_error, 'no_error'), ' | ') as last_errors
from public.push_subscriptions ps
group by ps.profile_id
order by max(ps.updated_at) desc
limit 50;

-- 5) Confirm recent push logs and dedupe behavior
select profile_id, reminder_id, channel, status, delivered_count, error, dedupe_key, created_at
from public.push_notification_logs
where created_at > now() - interval '2 hours'
order by created_at desc
limit 100;

-- 6) Permanent fix for current architecture:
-- Supabase pg_cron calls Vercel endpoint every 5 minutes.
-- Use BOTH Authorization and x-cron-secret so either server-side auth style works.
-- IMPORTANT: api/_supabase.js in this patch also accepts x-cron-secret.
select cron.unschedule('txpick-send-reminders');

select cron.schedule(
  'txpick-send-reminders',
  '*/5 * * * *',
  $$
  select net.http_get(
    url := 'https://txpick.com/api/cron/send-reminders',
    headers := jsonb_build_object(
      'Authorization', 'Bearer YOUR_CRON_SECRET',
      'x-cron-secret', 'YOUR_CRON_SECRET',
      'User-Agent', 'Supabase-pg-cron-TXPick/1.0'
    )
  );
  $$
);

-- 7) Verify job was recreated
select jobid, jobname, schedule, active, command
from cron.job
where jobname = 'txpick-send-reminders';
