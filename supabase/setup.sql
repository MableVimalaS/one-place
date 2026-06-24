-- ============================================================
--  One Place — database setup
--  Run once: Supabase Dashboard -> SQL Editor -> New query -> Run
-- ============================================================

create table if not exists public.playlists (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 80),
  created_at  timestamptz not null default now()
);

create table if not exists public.items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  playlist_id uuid references public.playlists (id) on delete set null,
  url         text not null,
  type        text not null,
  title       text,
  thumb       text,
  embed       text,
  audio       boolean not null default false,
  added_at    timestamptz not null default now()
);

create index if not exists items_user_idx     on public.items (user_id);
create index if not exists items_playlist_idx on public.items (playlist_id);
create index if not exists playlists_user_idx on public.playlists (user_id);

alter table public.playlists enable row level security;
alter table public.items     enable row level security;

drop policy if exists "own playlists - select" on public.playlists;
create policy "own playlists - select" on public.playlists for select using (auth.uid() = user_id);
drop policy if exists "own playlists - insert" on public.playlists;
create policy "own playlists - insert" on public.playlists for insert with check (auth.uid() = user_id);
drop policy if exists "own playlists - update" on public.playlists;
create policy "own playlists - update" on public.playlists for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "own playlists - delete" on public.playlists;
create policy "own playlists - delete" on public.playlists for delete using (auth.uid() = user_id);

drop policy if exists "own items - select" on public.items;
create policy "own items - select" on public.items for select using (auth.uid() = user_id);
drop policy if exists "own items - insert" on public.items;
create policy "own items - insert" on public.items for insert with check (auth.uid() = user_id);
drop policy if exists "own items - update" on public.items;
create policy "own items - update" on public.items for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "own items - delete" on public.items;
create policy "own items - delete" on public.items for delete using (auth.uid() = user_id);
