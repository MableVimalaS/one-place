# One Place

Your favorite videos and music from every platform — collected, organized, and played in one place. Links, never downloads: media streams from YouTube and Spotify through their official players.

## Stack

- **Vite + React 18 + TypeScript** — the browser app (UI)
- **Supabase** — login + database (your backend, no server code to write)
- **TanStack Query** — data fetching, caching, and mutations
- **Vitest** — unit tests

## Setup

1. Create a free project at [supabase.com](https://supabase.com).
2. In Supabase → **SQL Editor**, run [`supabase/setup.sql`](supabase/setup.sql) (creates tables + row-level security).
3. In Supabase → **Authentication → Providers → Email**, turn **off** "Confirm email" for instant login.
4. Copy `.env.example` to `.env` and fill in your **Project URL** and **anon/publishable key** (Supabase → Settings → API).

## Run

```bash
npm install
npm run dev        # start the dev server (http://localhost:5173)
```

Other scripts:

```bash
npm run test       # run unit tests
npm run typecheck  # TypeScript check
npm run build      # production build into dist/
```

## How it works

- Paste a YouTube or Spotify link → it's parsed ([`src/lib/parseLink.ts`](src/lib/parseLink.ts)) and saved to Supabase.
- Your library and playlists are scoped to your login by row-level security — no one sees anyone else's data.
- Press play → the official embedded player streams the media. Nothing is stored or downloaded.

## Structure

```
src/
  lib/         supabase client, link parsing, oembed, gradients, types
  hooks/       useAuth, usePlaylists, useItems (TanStack Query)
  components/
    auth/      AuthGate (sign in / sign up)
    layout/    Sidebar (playlists)
    library/   PasteBar, Library (grid), MediaCard
    player/    PlayerModal
  styles/      tokens.css, global.css
```

https://one-place-wheat.vercel.app/
