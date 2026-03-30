import { NextResponse } from "next/server";

import { parsePostScoreBody } from "@/lib/scores/validate";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "SERVICE_UNAVAILABLE" },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const parsed = parsePostScoreBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { data, error } = await admin
    .from("scores")
    .insert({
      player_name: parsed.data.player_name,
      game_slug: parsed.data.game_slug,
      score: parsed.data.score,
      level: parsed.data.level ?? 1,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[api/scores]", error);
    return NextResponse.json({ error: "INSERT_FAILED" }, { status: 500 });
  }

  return NextResponse.json({ ok: true as const, id: data.id });
}
