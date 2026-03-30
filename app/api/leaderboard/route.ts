import { NextResponse } from "next/server";

import { parseLeaderboardQuery } from "@/lib/scores/validate";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "SERVICE_UNAVAILABLE" },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const parsed = parseLeaderboardQuery(searchParams);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { data, error } = await admin
    .from("scores")
    .select("id, player_name, game_slug, score, level, created_at")
    .eq("game_slug", parsed.game)
    .order("score", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(parsed.limit);

  if (error) {
    console.error("[api/leaderboard]", error);
    return NextResponse.json({ error: "QUERY_FAILED" }, { status: 500 });
  }

  return NextResponse.json({ rows: data ?? [] });
}
