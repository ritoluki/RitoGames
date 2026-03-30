export interface Cell {
  x: number;
  y: number;
}

export interface Direction {
  dx: number;
  dy: number;
}

export const GRID_SIZE = 20;

export const POINTS_PER_FOOD = 10;

export function opposite(a: Direction, b: Direction): boolean {
  return a.dx === -b.dx && a.dy === -b.dy;
}

export function randomFood(snake: readonly Cell[]): Cell {
  const taken = new Set(snake.map((c) => `${c.x},${c.y}`));
  let cell: Cell;
  let guard = 0;
  do {
    cell = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    guard += 1;
  } while (taken.has(`${cell.x},${cell.y}`) && guard < 500);
  return cell;
}

export function initialSnake(): Cell[] {
  const mid = Math.floor(GRID_SIZE / 2);
  return [
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid },
  ];
}

export function tickIntervalMs(level: number): number {
  return Math.max(45, 130 - (level - 1) * 6);
}

export function levelFromEaten(eaten: number): number {
  return 1 + Math.floor(eaten / 4);
}
