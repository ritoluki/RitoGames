import type { Cell, Direction } from "@/lib/games/snakeLogic";

/** Mutable game state shared by 2D/3D renderers and the tick loop */
export interface SnakeGameRefState {
  snake: Cell[];
  food: Cell;
  dir: Direction;
  pending: Direction;
  eaten: number;
}
