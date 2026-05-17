# TXPick Reminder/Notification Audit Result

## Main finding
The current Supabase pg_cron command calls:

`https://txpick.com/api/cron/send-reminders`

with only `x-cron-secret`.

But the Vercel endpoint auth helper currently accepts only:

`Authorization: Bearer CRON_SECRET`

So if `CRON_SECRET` is set in Vercel, automatic pg_cron calls can return `401 Unauthorized` while manual curl tests may still succeed if tested with a different header or directly in the browser.

## Fix included
`api/_supabase.js` now accepts both:

- `Authorization: Bearer CRON_SECRET`
- `x-cron-secret: CRON_SECRET`

The SQL script also recreates the Supabase cron job with both headers.

## Do not use Vercel Cron
This still does not use Vercel Cron. Supabase pg_cron remains the scheduler. Vercel only hosts the API endpoint.

## Verify production
Run `supabase/sql/production_cron_audit_and_fix.sql` in Supabase SQL Editor.

After 5 minutes, check `net._http_response`:

- `200` = cron is hitting endpoint correctly
- `401` = secret/header mismatch remains
- `500` = endpoint/env/server error

Then create a reminder 6–10 minutes ahead, close the iPhone PWA, and check:

- `push_notification_logs` has a new row
- `delivered_count >= 1`
- `push_subscriptions.last_sent_at` updated

If logs show sent but iPhone does not display, the backend pipeline is working and the remaining issue is iPhone/PWA-level delivery/display.
