"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client (public / publishable key).
 * Dashboard may show "anon" or "Publishable default key" — same role.
 */
export function createSupabaseBrowser(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL and a public key (NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY)",
    );
  }
  return createClient(url, key);
}
