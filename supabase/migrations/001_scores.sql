-- Run in Supabase SQL Editor (or via Supabase CLI) before using /api/scores and /api/leaderboard.
-- Table: public.scores

create table if not exists public.scores (
  id          uuid primary key default gen_random_uuid(),
  player_name text not null,
  game_slug   text not null,
  score       integer not null,
  level       integer not null default 1,
  created_at  timestamptz not null default now()
);

create index if not exists idx_scores_game_score
  on public.scores (game_slug, score desc);

comment on table public.scores is 'Arcade scores; written via Next.js API using service role.';

-- RLS: default deny for anon/authenticated JWT; service role bypasses RLS for server-side API.
alter table public.scores enable row level security;

-- Optional later: add policies if you want direct client reads (e.g. realtime) with anon key.
