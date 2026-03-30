"use client";

import { useQuery } from "@tanstack/react-query";

import type { GameSlug } from "@/types/game";
import type { ScoreRow } from "@/types/score";

async function fetchLeaderboard(game: GameSlug): Promise<ScoreRow[]> {
  const res = await fetch(`/api/leaderboard?game=${encodeURIComponent(game)}&limit=10`);
  if (!res.ok) {
    let code = "FETCH_FAILED";
    try {
      const err = (await res.json()) as { error?: string };
      if (err.error) code = err.error;
    } catch {
      /* ignore */
    }
    throw new Error(code);
  }
  const data = (await res.json()) as { rows?: ScoreRow[] };
  return data.rows ?? [];
}

export function useLeaderboardQuery(game: GameSlug) {
  return useQuery({
    queryKey: ["leaderboard", game],
    queryFn: () => fetchLeaderboard(game),
    refetchInterval: 30_000,
  });
}
