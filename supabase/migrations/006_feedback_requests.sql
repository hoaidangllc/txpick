-- TXPick feedback / review foundation.
-- Premium and AI upgrade UI can stay hidden while real users send feature requests.

create table if not exists public.feedback_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references auth.users(id) on delete cascade,
  workspace_type text not null default 'personal',
  category text not null default 'feature_request',
  subject text,
  message text not null default '',
  contact_email text,
  voice_note_url text,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists feedback_requests_profile_created_idx
  on public.feedback_requests(profile_id, created_at desc);

create index if not exists feedback_requests_status_created_idx
  on public.feedback_requests(status, created_at desc);

alter table public.feedback_requests enable row level security;

drop policy if exists "Users manage own feedback" on public.feedback_requests;
create policy "Users manage own feedback"
  on public.feedback_requests for all
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- Optional voice feedback storage. Users can upload only to their own folder.
insert into storage.buckets (id, name, public)
values ('feedback-voice-notes', 'feedback-voice-notes', false)
on conflict (id) do nothing;

drop policy if exists "Users upload own voice feedback" on storage.objects;
create policy "Users upload own voice feedback"
  on storage.objects for insert
  with check (
    bucket_id = 'feedback-voice-notes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users read own voice feedback" on storage.objects;
create policy "Users read own voice feedback"
  on storage.objects for select
  using (
    bucket_id = 'feedback-voice-notes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users delete own voice feedback" on storage.objects;
create policy "Users delete own voice feedback"
  on storage.objects for delete
  using (
    bucket_id = 'feedback-voice-notes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
