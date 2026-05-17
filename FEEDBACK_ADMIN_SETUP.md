# TXPick Feedback Admin + Email Setup

## What was added

- User feedback still saves to Supabase table `feedback_requests`.
- Admin-only page: `/admin/feedback`.
- Admin email allowed by default: `ddh2755@gmail.com`.
- No realtime subscription is used.
- Email notification is optional and server-side only.

## Supabase SQL

Run these migrations in order if not already applied:

1. `supabase/migrations/006_feedback_requests.sql`
2. `supabase/migrations/007_feedback_admin_email.sql`

## Vercel environment variables

Required for admin API routes:

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_SUPABASE_URL=https://your-project.supabase.co
```

Optional for email notification:

```env
RESEND_API_KEY=your-resend-api-key
FEEDBACK_NOTIFY_EMAIL=ddh2755@gmail.com
FEEDBACK_FROM_EMAIL=TXPick <onboarding@resend.dev>
ADMIN_EMAILS=ddh2755@gmail.com
```

If `RESEND_API_KEY` is missing, feedback still saves to Supabase and appears in `/admin/feedback`; only email notification is skipped.

## Recommended flow

User submits feedback → Supabase saves row → Vercel API sends email alert → Hoài opens `/admin/feedback` to review and mark New / Reviewed / Planned / Done / Archived.
