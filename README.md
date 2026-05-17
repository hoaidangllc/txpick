# TXPick

TXPick is a mobile-first daily organizer for reminders, bills, personal expenses, business records, 1099/W-2 tracking, feedback, and year-end summaries.

## Product position

TXPick no longer means sports picks. It now means: pick what matters today.

The app should stay simple enough for non-technical users:

- Today view
- Phone reminders
- Bills
- Personal expenses
- Business Tax Center
- Feedback
- Privacy and Terms

## Run locally

```bash
npm install
npm run dev
```

Create a local `.env` from `.env.example` and add only your own local values.

## Production safety rules

Never expose server secrets in browser variables.

Allowed frontend variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_URL`
- `VITE_WEB_PUSH_PUBLIC_KEY`

Server-only variables:

- `SUPABASE_SERVICE_ROLE_KEY`
- `WEB_PUSH_PRIVATE_KEY`
- `RESEND_API_KEY`
- `OPENAI_API_KEY`
- `CRON_SECRET`

AI features must run through a server route or Supabase Edge Function. Do not call OpenAI directly from the browser.

## Public launch checklist

- Google login works on iPhone Safari, Android Chrome, and installed PWA
- PWA install works and app name shows as TXPick
- Phone reminders work on lock screen
- Repeat and overdue reminders are tested
- Feedback sends to database/email
- Privacy Policy and Terms are visible
- RLS policies are applied
- No old sportsbook pages/routes are visible
- No TX Life wording remains in the UI
