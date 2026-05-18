# TXPick Public Beta Pack 5

This pack keeps the current app architecture and adds production-safe polish only.

## Included

- Starter checklist on Today page for first-time users.
- Lightweight analytics foundation (`app_events`) with safe local queue fallback.
- Pricing/Upgrade page polished as Coming Soon only; no payment is active yet.
- Free / Plus $1.99 / Pro $4.99 plan UI aligned with public beta direction.
- Settings links now expose upgrade plans without aggressive popup upsell.
- Fixed duplicate due-day input in Today bill modal.
- Small retention events: Today opened, smart quick add, quick bill/expense, pricing click.

## Important

- No rewrite.
- No billing.
- No chatbot.
- No native Android build yet.
- Analytics payloads should stay non-sensitive.

## SQL to run

Run:

`supabase/migration_006_public_beta_analytics.sql`

## QA checklist

- `npm run lint`
- `npm run build`
- Login as new user and confirm Today starter checklist appears.
- Add one reminder, bill, and expense; starter checklist should disappear after all three exist.
- Visit `/pricing`; Plus and Pro should show Launching Soon and must not activate payment.
- Settings -> Smart Assistant Pro -> View upgrade plans should open pricing.
- Quick Add on Today should still create reminder/bill/expense.
