# TXPick Life App Batch Update

Direction implemented:
- TXPick repositioned as a daily life management app for Vietnamese people in the U.S.
- Today Page is the main app page after login.
- Core modules are Reminder, Expense, Monthly Bills, Summary, and Smart Tools.
- Personal and Business share the same Today Page and are separated by category.
- AI is light/cost-controlled: local natural reminder parsing, cached daily insight, limited daily AI action counters.
- App remains usable without AI.

Disabled/removed from active app flow:
- AI tax advice
- Receipt/photo scan
- Unlimited AI chat
- Mileage tracking
- Complicated tax forms
- Old Tax/AI/Business/Personal dashboard routes now redirect to the new flow.

New routes:
- /today
- /reminders
- /expenses
- /bills
- /summary
- /smart
- /pricing

Build status:
- npm run build: PASS
- npm run lint: PASS after adding a project ESLint config

Notes:
- Data is still localStorage-based in this batch, matching the existing lightweight app style.
- Stripe/subscription enforcement is represented as local plan switching for now. Wire real payments later.
- Supabase persistence can be added next without rewriting the UI because the store API is isolated.
