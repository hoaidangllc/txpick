# TX Life — Background Push Reminders Setup

This batch adds real Web Push reminders for the Vite + Vercel app.

## What was added

- `public/sw.js` receives push events and opens `/reminders` when tapped.
- `src/lib/notifications.js` can subscribe/unsubscribe the device and send a test push.
- `src/pages/Settings.jsx` includes a phone reminders control panel.
- `api/push/subscribe.js` saves the device subscription.
- `api/push/unsubscribe.js` disables the device subscription.
- `api/push/test.js` sends a test notification to the logged-in user.
- `api/cron/send-reminders.js` checks due reminders and sends background Web Push.
- `supabase/migration_005_web_push_reminders.sql` creates push tables/logs.
- `vercel.json` runs the cron every 5 minutes.

## Required Supabase SQL

Run:

```sql
-- supabase/migration_005_web_push_reminders.sql
```

## Required Vercel environment variables

Generate keys locally:

```bash
npm install
npm run push:keys
```

Add the generated values to Vercel:

```bash
VITE_WEB_PUSH_PUBLIC_KEY=...
WEB_PUSH_PUBLIC_KEY=...
WEB_PUSH_PRIVATE_KEY=...
WEB_PUSH_SUBJECT=mailto:your-email@example.com
CRON_SECRET=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_URL=...
```

`SUPABASE_URL` can be the same value as `VITE_SUPABASE_URL`.

## Test flow

1. Deploy to Vercel.
2. Login on phone.
3. Install/Add to Home Screen if possible.
4. Open Settings → Phone reminders.
5. Tap Enable push reminders.
6. Tap Send test notification.
7. Create a reminder due 5–10 minutes from now.
8. Wait for cron. It runs every 5 minutes.

## Important notes

- Web Push works best when the app is installed as PWA on mobile.
- iPhone behavior depends on iOS/Safari PWA permission rules.
- Cron checks reminders every 5 minutes, so notifications can arrive a few minutes late.
- This is not an AI chat system and does not add receipt scanning or heavy features.
