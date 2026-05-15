# TX Life Push Reminders

TX Life uses Web Push for real phone reminders.

## Current production path

- Vercel hosts the Vite/PWA app only.
- Vercel Cron is not used for production reminders.
- Supabase stores push subscriptions.
- Supabase Edge Function `send-reminders` sends due reminders.
- Supabase `pg_cron` or Supabase scheduled jobs call that function every 5 minutes.

## Why not Vercel Cron?

Vercel Hobby cron is not reliable enough for reminder timing because it is too limited for frequent schedules. For the near-free beta path, Supabase should own the reminder scheduler.

## Setup files

- `public/sw.js` receives push events and shows notifications.
- `src/lib/notifications.js` subscribes/unsubscribes the current device.
- `api/push/subscribe.js` saves a browser push subscription.
- `api/push/unsubscribe.js` disables a browser push subscription.
- `api/push/test.js` sends a manual test push.
- `supabase/functions/send-reminders/index.ts` is the production reminder sender.
- `supabase/migrations/005_supabase_edge_push_reminders.sql` creates push tables and indexes.

`api/cron/send-reminders.js` may remain as a manual/legacy fallback endpoint, but it is not the production scheduler.

## Required env vars

Frontend/Vercel:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_WEB_PUSH_PUBLIC_KEY=your-public-vapid-key
```

Server/Vercel API fallback and push test endpoints:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
WEB_PUSH_PUBLIC_KEY=your-public-vapid-key
WEB_PUSH_PRIVATE_KEY=your-private-vapid-key
WEB_PUSH_SUBJECT=mailto:you@example.com
CRON_SECRET=make-a-long-random-secret
REMINDER_LOOKBACK_MINUTES=8
```

Supabase Edge Function secrets:

```bash
supabase secrets set SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
supabase secrets set WEB_PUSH_PUBLIC_KEY="YOUR_PUBLIC_VAPID_KEY"
supabase secrets set WEB_PUSH_PRIVATE_KEY="YOUR_PRIVATE_VAPID_KEY"
supabase secrets set WEB_PUSH_SUBJECT="mailto:you@example.com"
supabase secrets set CRON_SECRET="make-a-long-random-secret"
```

## Deploy function

```bash
supabase functions deploy send-reminders --no-verify-jwt
```

## SQL setup

Run:

```sql
-- supabase/migrations/005_supabase_edge_push_reminders.sql
```

Then create the 5-minute schedule using the template in that migration or in `SUPABASE_PUSH_SETUP.md`.

## Phone test

1. Deploy Vercel.
2. Open the app on the phone.
3. Install PWA / Add to Home Screen.
4. Log in.
5. Settings → enable notification.
6. Tap test notification.
7. Create a reminder 5–10 minutes from now.
8. Close the app.
9. Wait for the Supabase schedule.

Important for iPhone: Web Push requires the PWA to be installed to Home Screen.
