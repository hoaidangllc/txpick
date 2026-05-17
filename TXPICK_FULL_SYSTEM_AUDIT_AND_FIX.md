# TXPick Full System Audit + Fix Batch

## Goal

Return the product identity to TXPick so it matches txpick.com, while keeping the new daily organizer direction.

TXPick now means: pick what matters today.

## Applied fixes

### Brand / identity
- Replaced TX Life UI branding with TXPick.
- Updated Logo component to show TXPick.
- Updated PWA manifest name/short name to TXPick.
- Updated favicon accessibility label and gradient ids.
- Updated metadata/title/OpenGraph copy.
- Updated feedback email copy and push notification copy through global text cleanup.
- Removed old wording that made the product feel disconnected from the txpick.com domain.

### Security / keys
- Removed the real `.env` file from this deliverable.
- Removed frontend OpenAI browser calls.
- Replaced `src/lib/openai.js` with safe server-only stubs.
- Rewrote `.env.example` with clear frontend-safe vs server-only variables.
- Added explicit rule: no `VITE_OPENAI_API_KEY`, no service role key in frontend.

### Trust pages
- Added `/privacy`.
- Added `/terms`.
- Footer links now route to those pages through existing footer paths.

### RLS / Supabase
- Added `supabase/migrations/008_rls_security_hardening.sql`.
- Hardens RLS for profiles, reminders, bills, expenses, daily summaries, feedback, push subscriptions/logs, and business tax tables.
- Uses auth.uid ownership rules.
- Leaves push insert/update to server-side code.

### Mobile UX
- Added floating mobile quick-add button.
- Quick-add menu links to Reminder, Expense, Bill, and Business/Tax flows.
- Keeps mobile-first workflow faster without making the nav too crowded.

### Product copy
- Kept premium hidden while feedback is the public CTA.
- Reframed TXPick as daily organizer, not TX Life.
- Documentation updated to avoid old direct-browser AI and demo/paywall language.

## Verification

- `npm install` completed.
- `npm run build` passed.
- `npm run lint` passed.

## Still requires real-device testing

These cannot be fully verified inside the sandbox and must be tested on real devices:

- iPhone Safari Google login.
- iPhone PWA Add to Home Screen.
- iPhone lock-screen notification.
- Android Chrome install and notification.
- Overnight reminder reliability.
- Supabase cron / Edge Function reminder sending.
- Feedback email delivery through Resend.

## Recommended next manual steps

1. Replace project files with this zip.
2. Run `npm install`.
3. Run `npm run build`.
4. Apply Supabase migration `008_rls_security_hardening.sql`.
5. Set Vercel environment variables from `.env.example`.
6. Deploy.
7. Test on iPhone and Android.
