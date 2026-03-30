import { GAMES } from "@/lib/games";
import type { PostScoreBody } from "@/types/score";
import type { GameSlug } from "@/types/game";

const ALLOWED_SLUGS = new Set<string>(GAMES.map((g) => g.slug));

const MAX_NAME_LENGTH = 24;
const MAX_SCORE = 2_147_483_647;
const MAX_LEVEL = 9999;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parsePostScoreBody(
  body: unknown,
): { ok: true; data: PostScoreBody } | { ok: false; error: string } {
  if (!isRecord(body)) {
    return { ok: false, error: "INVALID_JSON" };
  }

  const playerNameRaw = body.player_name;
  if (typeof playerNameRaw !== "string") {
    return { ok: false, error: "INVALID_PLAYER_NAME" };
  }
  const player_name = playerNameRaw.trim().slice(0, MAX_NAME_LENGTH);
  if (player_name.length < 1) {
    return { ok: false, error: "INVALID_PLAYER_NAME" };
  }

  const gameSlugRaw = body.game_slug;
  if (typeof gameSlugRaw !== "string" || !ALLOWED_SLUGS.has(gameSlugRaw)) {
    return { ok: false, error: "INVALID_GAME_SLUG" };
  }
  const game_slug = gameSlugRaw as GameSlug;

  const scoreRaw = body.score;
  if (typeof scoreRaw !== "number" || !Number.isInteger(scoreRaw) || scoreRaw < 0 || scoreRaw > MAX_SCORE) {
    return { ok: false, error: "INVALID_SCORE" };
  }

  let level = 1;
  if (body.level !== undefined) {
    if (typeof body.level !== "number" || !Number.isInteger(body.level) || body.level < 1 || body.level > MAX_LEVEL) {
      return { ok: false, error: "INVALID_LEVEL" };
    }
    level = body.level;
  }

  return {
    ok: true,
    data: { player_name, game_slug, score: scoreRaw, level },
  };
}

export function parseLeaderboardQuery(searchParams: URLSearchParams): {
  ok: true;
  game: GameSlug;
  limit: number;
} | {
  ok: false;
  error: string;
} {
  const gameRaw = searchParams.get("game");
  if (!gameRaw || !ALLOWED_SLUGS.has(gameRaw)) {
    return { ok: false, error: "INVALID_GAME" };
  }
  const limitRaw = searchParams.get("limit");
  let limit = 10;
  if (limitRaw !== null) {
    const n = Number.parseInt(limitRaw, 10);
    if (!Number.isInteger(n) || n < 1 || n > 100) {
      return { ok: false, error: "INVALID_LIMIT" };
    }
    limit = n;
  }
  return { ok: true, game: gameRaw as GameSlug, limit };
}
