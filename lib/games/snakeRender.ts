import type { Cell, Direction } from "@/lib/games/snakeLogic";

export interface SnakeRenderOptions {
  ctx: CanvasRenderingContext2D;
  logicalSize: number;
  gridSize: number;
  cell: number;
  snake: readonly Cell[];
  food: Cell;
  headDirection: Direction;
  /** `performance.now()` for subtle motion */
  timeMs: number;
}

const BG_TOP = "#0c0c14";
const BG_MID = "#10101c";
const BG_BOTTOM = "#08080e";

const GRID_LINE = "rgba(44, 44, 72, 0.35)";
const GRID_DOT = "rgba(100, 100, 140, 0.12)";

const SNAKE_HEAD = "#d4ff4a";
const SNAKE_HEAD_EDGE = "#7cb518";
const SNAKE_TAIL = "#3d5220";
const ACCENT_PURPLE = "rgba(124, 92, 252, 0.15)";

const FOOD_CORE = "#ff6b8a";
const FOOD_GLOW = "#ff3d6a";

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function snakeColorAtIndex(index: number, total: number): string {
  if (total <= 1) return SNAKE_HEAD;
  const t = index / Math.max(total - 1, 1);
  const r1 = 0xd4;
  const g1 = 0xff;
  const b1 = 0x4a;
  const r0 = 0x4a;
  const g0 = 0x62;
  const b0 = 0x28;
  const r = Math.round(r0 + (r1 - r0) * t);
  const g = Math.round(g0 + (g1 - g0) * t);
  const b = Math.round(b0 + (b1 - b0) * t);
  return `rgb(${r},${g},${b})`;
}

/**
 * Full-frame render for the Snake board (ARCADIA neon / depth look).
 */
export function renderSnakeFrame(o: SnakeRenderOptions): void {
  const { ctx, logicalSize, gridSize, cell, snake, food, headDirection, timeMs } =
    o;
  const t = timeMs * 0.001;

  // Background: vertical gradient + soft vignette
  const bg = ctx.createLinearGradient(0, 0, 0, logicalSize);
  bg.addColorStop(0, BG_TOP);
  bg.addColorStop(0.45, BG_MID);
  bg.addColorStop(1, BG_BOTTOM);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, logicalSize, logicalSize);

  const cx = logicalSize / 2;
  const cy = logicalSize / 2;
  const vignette = ctx.createRadialGradient(
    cx,
    cy,
    logicalSize * 0.2,
    cx,
    cy,
    logicalSize * 0.75,
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.45)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, logicalSize, logicalSize);

  // Subtle purple wash (brand accent)
  const wash = ctx.createRadialGradient(
    cx * 0.7,
    cy * 0.4,
    0,
    cx,
    cy,
    logicalSize * 0.55,
  );
  wash.addColorStop(0, ACCENT_PURPLE);
  wash.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, logicalSize, logicalSize);

  // Grid: faint lines
  ctx.strokeStyle = GRID_LINE;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= gridSize; i += 1) {
    const p = i * cell;
    ctx.moveTo(p, 0);
    ctx.lineTo(p, logicalSize);
    ctx.moveTo(0, p);
    ctx.lineTo(logicalSize, p);
  }
  ctx.stroke();

  // Dots at cell centers (depth)
  ctx.fillStyle = GRID_DOT;
  const dotR = 0.9;
  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      ctx.beginPath();
      ctx.arc(
        x * cell + cell / 2,
        y * cell + cell / 2,
        dotR,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  const pad = 2.25;
  const cornerR = 5;

  // Food: pulsing glow + gem-like core
  const pulse = 0.88 + 0.12 * Math.sin(t * 5);
  const fx = food.x * cell + pad;
  const fy = food.y * cell + pad;
  const fw = cell - pad * 2;
  const fh = cell - pad * 2;
  const fcx = fx + fw / 2;
  const fcy = fy + fh / 2;

  ctx.save();
  ctx.shadowColor = FOOD_GLOW;
  ctx.shadowBlur = 18 * pulse;
  const foodGrad = ctx.createRadialGradient(
    fcx - fw * 0.15,
    fcy - fh * 0.15,
    0,
    fcx,
    fcy,
    Math.max(fw, fh) * 0.65,
  );
  foodGrad.addColorStop(0, "#ffb3c4");
  foodGrad.addColorStop(0.45, FOOD_CORE);
  foodGrad.addColorStop(1, "#9a1a3a");
  ctx.fillStyle = foodGrad;
  roundRect(ctx, fx, fy, fw, fh, cornerR);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "rgba(255,255,255,0.45)";
  roundRect(ctx, fx + fw * 0.15, fy + fh * 0.12, fw * 0.35, fh * 0.22, 2);
  ctx.fill();
  ctx.restore();

  // Snake: body first (tail → head), then head detail
  const n = snake.length;
  for (let i = n - 1; i >= 0; i -= 1) {
    const seg = snake[i]!;
    const sx = seg.x * cell + pad;
    const sy = seg.y * cell + pad;
    const sw = cell - pad * 2;
    const sh = cell - pad * 2;
    const isHead = i === 0;

    ctx.save();
    if (isHead) {
      ctx.shadowColor = SNAKE_HEAD;
      ctx.shadowBlur = 14 + 4 * Math.sin(t * 6);
    } else {
      ctx.shadowColor = "rgba(200, 255, 80, 0.25)";
      ctx.shadowBlur = 4;
    }

    const base = snakeColorAtIndex(i, n);
    const g = ctx.createLinearGradient(sx, sy, sx + sw, sy + sh);
    if (isHead) {
      g.addColorStop(0, SNAKE_HEAD);
      g.addColorStop(0.55, SNAKE_HEAD_EDGE);
      g.addColorStop(1, "#5a8018");
    } else {
      g.addColorStop(0, base);
      g.addColorStop(1, SNAKE_TAIL);
    }
    ctx.fillStyle = g;
    roundRect(ctx, sx, sy, sw, sh, isHead ? cornerR + 0.5 : cornerR);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Inner highlight (top-left)
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    roundRect(ctx, sx + sw * 0.12, sy + sh * 0.1, sw * 0.45, sh * 0.28, 2);
    ctx.fill();

    // Border stroke
    ctx.strokeStyle = isHead
      ? "rgba(255,255,255,0.35)"
      : "rgba(0,0,0,0.35)";
    ctx.lineWidth = isHead ? 1.25 : 0.75;
    roundRect(ctx, sx, sy, sw, sh, isHead ? cornerR + 0.5 : cornerR);
    ctx.stroke();
    ctx.restore();
  }

  // Eyes on head
  if (n > 0) {
    const head = snake[0]!;
    const hx = head.x * cell;
    const hy = head.y * cell;
    const eyeOff = cell * 0.22;
    const eyeR = Math.max(1.8, cell * 0.09);
    let ex1 = hx + cell / 2;
    let ey1 = hy + cell / 2;
    let ex2 = hx + cell / 2;
    let ey2 = hy + cell / 2;
    if (headDirection.dx === 1) {
      ex1 = hx + cell - eyeOff;
      ex2 = hx + cell - eyeOff * 1.1;
      ey1 = hy + cell * 0.35;
      ey2 = hy + cell * 0.65;
    } else if (headDirection.dx === -1) {
      ex1 = hx + eyeOff;
      ex2 = hx + eyeOff * 1.1;
      ey1 = hy + cell * 0.35;
      ey2 = hy + cell * 0.65;
    } else if (headDirection.dy === -1) {
      ex1 = hx + cell * 0.35;
      ex2 = hx + cell * 0.65;
      ey1 = hy + eyeOff;
      ey2 = hy + eyeOff * 1.05;
    } else {
      ex1 = hx + cell * 0.35;
      ex2 = hx + cell * 0.65;
      ey1 = hy + cell - eyeOff;
      ey2 = hy + cell - eyeOff * 1.05;
    }
    ctx.fillStyle = "#0a0a0f";
    ctx.beginPath();
    ctx.arc(ex1, ey1, eyeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ex2, ey2, eyeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.beginPath();
    ctx.arc(ex1 - eyeR * 0.25, ey1 - eyeR * 0.25, eyeR * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ex2 - eyeR * 0.25, ey2 - eyeR * 0.25, eyeR * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  // Inner frame (glass edge)
  ctx.strokeStyle = "rgba(200, 255, 80, 0.12)";
  ctx.lineWidth = 2;
  ctx.strokeRect(1.5, 1.5, logicalSize - 3, logicalSize - 3);
}
