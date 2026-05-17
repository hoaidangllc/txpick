-- TXPick feedback admin/email upgrade.
-- Run after 006_feedback_requests.sql.

alter table public.feedback_requests
  add column if not exists email_notified_at timestamptz,
  add column if not exists email_error text;

create index if not exists feedback_requests_workspace_created_idx
  on public.feedback_requests(workspace_type, created_at desc);

create index if not exists feedback_requests_category_created_idx
  on public.feedback_requests(category, created_at desc);

-- Admin reads/updates happen through Vercel API using SUPABASE_SERVICE_ROLE_KEY.
-- Regular users keep the existing RLS policy from 006 and can only manage their own feedback.
