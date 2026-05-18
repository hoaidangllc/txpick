-- TXPick public beta hot-path indexes.
-- Safe to run multiple times. No schema changes.

-- Reminders: list + cron lookups frequently filter by profile_id and sort by due_at.
create index if not exists reminders_profile_due_idx
  on public.reminders(profile_id, due_at);

-- Bills: list + "due soon" lookups filter by profile_id and sort by due_date.
create index if not exists bills_profile_due_idx
  on public.bills(profile_id, due_date);

-- Expenses: list + monthly aggregations filter by profile_id and order by expense_date desc.
create index if not exists expenses_profile_date_idx
  on public.expenses(profile_id, expense_date desc);

-- Duplicate-reminder prevention support index.
-- The app does a SELECT before INSERT on (profile_id, title, due_at) to avoid
-- creating identical reminders. This index keeps that check O(log n).
create index if not exists reminders_dedupe_lookup_idx
  on public.reminders(profile_id, title, due_at)
  where completed = false;
