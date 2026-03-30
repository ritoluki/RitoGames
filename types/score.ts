import type { GameSlug } from "@/types/game";

/** Row returned from `scores` table (Supabase). */
export interface ScoreRow {
  id: string;
  player_name: string;
  game_slug: string;
  score: number;
  level: number;
  created_at: string;
}

/** POST /api/scores JSON body (validated server-side). */
export interface PostScoreBody {
  player_name: string;
  game_slug: GameSlug;
  score: number;
  level?: number;
}
