export type GameSlug = "snake" | "breakout" | "memory" | "asteroid";

export type GameStatus = "live" | "coming-soon";

export type GameColor = "green" | "red" | "purple" | "orange";

export interface GameMeta {
  slug: GameSlug;
  icon: string;
  status: GameStatus;
  color: GameColor;
}
