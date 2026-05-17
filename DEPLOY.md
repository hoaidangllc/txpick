# TXPick Deploy Notes

## 1. Install and build

```bash
npm install
npm run build
```

## 2. Vercel environment variables

Frontend-safe:

```txt
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_APP_URL=https://txpick.com
VITE_WEB_PUSH_PUBLIC_KEY=
```

Server-only:

```txt
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
CRON_SECRET=
WEB_PUSH_PUBLIC_KEY=
WEB_PUSH_PRIVATE_KEY=
WEB_PUSH_SUBJECT=mailto:support@txpick.com
RESEND_API_KEY=
FEEDBACK_NOTIFY_EMAIL=ddh2755@gmail.com
FEEDBACK_FROM_EMAIL=TXPick <onboarding@resend.dev>
ADMIN_EMAILS=ddh2755@gmail.com
```

Do not add `SUPABASE_SERVICE_ROLE_KEY`, `WEB_PUSH_PRIVATE_KEY`, `RESEND_API_KEY`, or `OPENAI_API_KEY` with a `VITE_` prefix.

## 3. Supabase

Run migrations in order, including:

- `004_tax_worker_income.sql`
- `005_supabase_edge_push_reminders.sql`
- `006_feedback_requests.sql`
- `007_feedback_admin_email.sql`
- `008_rls_security_hardening.sql`

## 4. Smoke test

Test on phone before public launch:

- Google login
- PWA install
- enable notifications
- send test notification
- add reminder
- add bill
- add expense
- submit feedback
- open Privacy and Terms
