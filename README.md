# TxPick

**Quản lý tài chính thông minh cho người Việt ở Mỹ.**
Smart finance management for Vietnamese-Americans — built for nail salons, restaurants, and families.

```
TxPick = Business + Personal + Tax + AI
```

## Quick start

```bash
npm install
npm run dev
```

The app boots at `http://localhost:5173`. A `.env` is already provisioned with the Supabase project `viqqwpbmkqhrpthxlsdc`, so auth and waitlist will hit the real database **as soon as you run the schema** (next section). If you want to demo offline instead, delete `.env` and the app falls back to mock mode.

## Supabase setup (one-time)

1. **Open the SQL editor** for your project:
   https://supabase.com/dashboard/project/viqqwpbmkqhrpthxlsdc/sql/new
2. **Paste the contents of `supabase/schema.sql`** and click **Run**.
   This creates 8 tables, RLS policies, an `updated_at` trigger, and an auth trigger that auto-creates a `profiles` row on signup.
3. **Enable Google OAuth** (optional, for the "Continue with Google" button):
   - Dashboard → Authentication → Providers → Google → enable
   - Add `http://localhost:5173/onboarding` and your production URL to the **Redirect URLs**
4. **Email templates** — Authentication → URL Configuration → set Site URL to `http://localhost:5173` in dev, your domain in prod.
5. **Rotate the secret key you shared in chat.** Settings → API → "Generate new secret key." Frontend never needs it; only Edge Functions / server scripts do.

The publishable (anon) key is the only Supabase credential in the React bundle. RLS policies enforce that every user can only read/write their own rows.

## Tech stack

- React 18 + Vite + React Router
- Tailwind CSS (custom brand palette in `tailwind.config.js`)
- Supabase (auth + Postgres) — `src/lib/supabase.js`
- OpenAI (`gpt-4o-mini` for vision + chat) — `src/lib/openai.js`
- Lucide React for icons
- Local-first storage (`src/lib/useLocalStore.js`) — drop-in API designed to be swapped for Supabase tables in production

## What's built (all 6 phases)

### Phase 1 — Landing page (`/`)
Hero, bilingual tagline, 4 feature cards, value props, waitlist form, footer. See `src/pages/Landing.jsx`.

### Phase 2 — Auth (`/login`, `/signup`, `/onboarding`)
Email + password, Google OAuth button, onboarding choice (Business / Personal / Both). See `src/pages/Login.jsx`, `Signup.jsx`, `Onboarding.jsx`.

### Phase 3 — Business module (`/business`)
Dashboard with month-over-month stats, expense entry (supply / utilities / rent / equipment…) with full bilingual category labels, recurring bills tracker, and 1099 worker roster (SSN stored last-4 only in UI).

### Phase 4 — Personal module (`/personal`)
Bills (mortgage, rent, utilities, car, insurance, subscriptions), debts & loans (credit card, personal, student, auto, mortgage) with APR and minimum payment, and date-based reminders.

### Phase 5 — Tax module (`/tax`)
Auto-maps your Business entries onto **Schedule C** line items (1, 8, 11, 20, 22, 25, 27a…) and produces a **1099-NEC** roster flagging contractors who hit the $600 threshold. Click *Export PDF* for a print-ready summary in your browser. Pop-up blocker must allow it.

### Phase 6 — AI Agent (`/ai`) — **Pro $9.99/mo**
- **Receipt scan**: tap a receipt photo → OpenAI vision parses vendor, date, total, and category → one click to save as an expense.
- **Bilingual chat** powered by `gpt-4o-mini`. Replies in whichever language the user writes in.
- **Smart alerts**: detects month-over-month spending anomalies (e.g. "Supply costs up 18%").
- **Tax tips**: bilingual deductible suggestions.

Paywall is locally toggled for demo. Wire Stripe (or Supabase webhooks) in production.

## Brand system

| | |
|---|---|
| Primary | `brand-600` — `#059669` (green, growth/money) |
| Surface | `ink-50` / `ink-900` — neutral slate |
| Accent | `gold-500` — `#f59e0b` (Pro / premium) |
| Display font | Plus Jakarta Sans |
| Body font | Inter |
| Logo | `src/components/Logo.jsx` — green tile, white "+" mark, gold coin |

Logo SVG is also exposed at `/public/favicon.svg`.

## Bilingual everywhere

All UI strings live in **`src/data/translations.js`** under `en` and `vi`. The active language is held by `LanguageContext` and toggled by the EN/VI pill in the top bar. Defaults to Vietnamese if `navigator.language` starts with `vi`.

To add a new string: add it to both `en` and `vi` blocks under the same key path, then read it via `useLang()` → `t.path.to.key`.

## Going to production

1. **Create a Supabase project.** Drop the URL + anon key into `.env`. The mock client in `src/lib/supabase.js` falls away automatically.
2. **Create tables** for: `expenses`, `recurring_bills`, `workers_1099`, `personal_bills`, `debts`, `reminders`, `profile`, `waitlist`. The shapes match the local-storage records in `src/lib/useLocalStore.js`.
3. **Enable Row-Level Security** so users only see their own rows.
4. **Move OpenAI calls** out of the browser into a Supabase Edge Function — the current `src/lib/openai.js` is for dev only. The browser exposes `VITE_OPENAI_API_KEY` to anyone who opens DevTools.
5. **Stripe** for the $9.99/mo Pro plan. On successful checkout, set a `pro=true` row in `profile` and have `AIAgent.jsx` read it instead of `localStorage`.
6. **Deploy** to Vercel, Netlify, or Cloudflare Pages. `vite build` outputs `dist/`.

## Project layout

```
src/
  main.jsx, App.jsx, index.css
  contexts/
    AuthContext.jsx          # Supabase session + profile
    LanguageContext.jsx      # EN/VI toggle
  data/
    translations.js          # every bilingual string
  lib/
    supabase.js              # client (real + mock)
    openai.js                # chat + receipt vision
    useLocalStore.js         # tiny CRUD hook (swap for Supabase)
  components/
    Logo.jsx, LanguageToggle.jsx, Footer.jsx
    AppShell.jsx, ProtectedRoute.jsx
    Modal.jsx, StatCard.jsx
  pages/
    Landing.jsx              # Phase 1
    Login.jsx, Signup.jsx, Onboarding.jsx   # Phase 2
    BusinessDashboard.jsx    # Phase 3
    PersonalDashboard.jsx    # Phase 4
    Tax.jsx                  # Phase 5
    AIAgent.jsx              # Phase 6
```

## Roadmap

- Replace local-storage with Supabase RLS-protected tables.
- Wire Stripe for Pro subscription.
- Move OpenAI calls to Supabase Edge Functions.
- Replace print-to-PDF Schedule C export with `@react-pdf/renderer` filling the official IRS form template.
- iOS/Android wrappers via Capacitor.
- Push notifications for due-date reminders.

—

© TxPick. Quản lý tài chính thông minh cho người Việt ở Mỹ.
