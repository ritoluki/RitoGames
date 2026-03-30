import type { GameMeta } from "@/types/game";

export const GAMES: readonly GameMeta[] = [
  {
    slug: "snake",
    icon: "🐍",
    status: "live",
    color: "green",
  },
  {
    slug: "breakout",
    icon: "🧱",
    status: "coming-soon",
    color: "red",
  },
  {
    slug: "memory",
    icon: "🃏",
    status: "coming-soon",
    color: "purple",
  },
  {
    slug: "asteroid",
    icon: "🪐",
    status: "coming-soon",
    color: "orange",
  },
] as const;
