-- ============================================================
--  One Place — cloud library (run ONCE in Supabase SQL Editor,
--  after setup.sql). Lets you store audio files you own in the
--  cloud so they sync to every device you log in on.
-- ============================================================

-- 1) Private bucket for your own audio files.
insert into storage.buckets (id, name, public)
values ('library', 'library', false)
on conflict (id) do nothing;

-- 2) Each user can read/add/remove only files inside their own folder
--    (the path always starts with their user id).
drop policy if exists "library read own" on storage.objects;
create policy "library read own" on storage.objects
  for select using (
    bucket_id = 'library' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "library insert own" on storage.objects;
create policy "library insert own" on storage.objects
  for insert with check (
    bucket_id = 'library' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "library delete own" on storage.objects;
create policy "library delete own" on storage.objects
  for delete using (
    bucket_id = 'library' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3) Remember where each uploaded file lives.
alter table public.items add column if not exists storage_path text;
