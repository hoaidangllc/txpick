# TX Life Push Reminders — Supabase Scheduler Path

This project no longer uses Vercel Cron as the production reminder scheduler.

## Production architecture

- Vercel: hosts the Vite React PWA only.
- Supabase: Auth + Database + Push subscriptions + scheduled reminder job.
- Supabase Edge Function: `send-reminders` runs every 5 minutes and sends Web Push notifications.
- Browser/PWA: service worker receives the push and shows the phone notification.

## Why Vercel Cron was removed

Vercel Hobby cron is too limited for reminder timing. TX Life needs reminders around the selected time, so production scheduling should run from Supabase or another external cron.

`vercel.json` intentionally has no `crons` block now.

The old Vercel API route `/api/cron/send-reminders` can stay as a manual/legacy fallback only. Do not rely on it for the free production path.

## Files added/changed

- `vercel.json` — removed the Vercel cron schedule.
- `supabase/functions/send-reminders/index.ts` — Supabase Edge Function that sends due reminders.
- `supabase/migrations/005_supabase_edge_push_reminders.sql` — push tables, indexes, RLS, and schedule template.
- `SUPABASE_PUSH_SETUP.md` — this setup guide.

## Required env vars

### Vercel

Keep these for the frontend/API push subscription and test buttons:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
WEB_PUSH_PUBLIC_KEY=...
# Optional fallback for fully static frontend builds:
VITE_WEB_PUSH_PUBLIC_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
WEB_PUSH_PRIVATE_KEY=...
WEB_PUSH_SUBJECT=mailto:your-email@example.com
CRON_SECRET=make-a-long-random-secret
```

### Supabase Edge Function secrets

Set these in Supabase for the Edge Function:

```bash
supabase secrets set SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
supabase secrets set WEB_PUSH_PUBLIC_KEY="YOUR_PUBLIC_VAPID_KEY"
supabase secrets set WEB_PUSH_PRIVATE_KEY="YOUR_PRIVATE_VAPID_KEY"
supabase secrets set WEB_PUSH_SUBJECT="mailto:your-email@example.com"
supabase secrets set CRON_SECRET="make-a-long-random-secret"
```

`WEB_PUSH_PUBLIC_KEY` is required for the Vercel API public-key endpoint and Supabase Edge Function. `VITE_WEB_PUSH_PUBLIC_KEY` is optional now; keep it only if you want the frontend to read the key directly.

## Deploy the function

```bash
supabase functions deploy send-reminders --no-verify-jwt
```

`--no-verify-jwt` is okay because the function checks `CRON_SECRET` when you set it.

## Run SQL migration

Run:

```sql
-- supabase/migrations/005_supabase_edge_push_reminders.sql
```

Then create the schedule. Replace placeholders before running:

```sql
select cron.unschedule('txlife-send-reminders-every-5-minutes');

select cron.schedule(
  'txlife-send-reminders-every-5-minutes',
  '*/5 * * * *',
  $$
  select
    net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-reminders',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY',
        'x-cron-secret', 'YOUR_CRON_SECRET'
      ),
      body := jsonb_build_object('source', 'pg_cron')
    );
  $$
);
```

If you do not want to paste the service role key into SQL, use Supabase Dashboard scheduled functions or a trusted external cron that sends `x-cron-secret`.

## Manual test

After deploy, test the Edge Function directly:

```bash
curl -X POST "https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-reminders" \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "x-cron-secret: YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"test":true}'
```

Expected response:

```json
{ "ok": true, "source": "supabase_edge_function", "checked": 0, "due": 0, "sent": 0 }
```

## Phone test

1. Deploy Vercel.
2. Open TX Life on the phone.
3. Install PWA / Add to Home Screen.
4. Log in.
5. Settings → enable notifications.
6. Tap test notification.
7. Create a reminder 5–10 minutes from now.
8. Close the app.
9. Wait for the Supabase schedule to run.

For iPhone, Web Push requires the app to be installed to Home Screen.
