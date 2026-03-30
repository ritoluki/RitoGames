"use client";

import { useQueryClient } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import CountUp from "react-countup";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import GameCanvas from "@/components/games/GameCanvas";
import {
  GRID_SIZE,
  POINTS_PER_FOOD,
  initialSnake,
  levelFromEaten,
  opposite,
  randomFood,
  tickIntervalMs,
  type Cell,
  type Direction,
} from "@/lib/games/snakeLogic";
import { renderSnakeFrame } from "@/lib/games/snakeRender";
import { useGameLoop } from "@/lib/hooks/useGameLoop";
import { useKeyboard } from "@/lib/hooks/useKeyboard";
import { useLocalBestScore } from "@/lib/hooks/useLocalBestScore";
import { playDieSound, playEatSound, resumeAudio } from "@/lib/sounds/synth";
import { useGameStore } from "@/lib/store/gameStore";

const CELL = 16;

type Phase = "idle" | "playing" | "gameover";

interface GameRefState {
  snake: Cell[];
  food: Cell;
  dir: Direction;
  pending: Direction;
  eaten: number;
}

export default function SnakeGame() {
  const t = useTranslations("game");
  const queryClient = useQueryClient();
  const { isMuted, toggleMute, playerName, setPlayerName } = useGameStore();
  const { best, updateBest } = useLocalBestScore("snake");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameRefState>({
    snake: initialSnake(),
    food: randomFood(initialSnake()),
    dir: { dx: 1, dy: 0 },
    pending: { dx: 1, dy: 0 },
    eaten: 0,
  });
  const scoreRef = useRef(0);

  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const phaseRef = useRef<Phase>("idle");
  phaseRef.current = phase;

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const logical = GRID_SIZE * CELL;
    if (canvas.width !== logical * dpr) {
      canvas.width = logical * dpr;
      canvas.height = logical * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const { snake, food, dir } = stateRef.current;
    const timeMs =
      typeof performance !== "undefined" ? performance.now() : 0;

    renderSnakeFrame({
      ctx,
      logicalSize: logical,
      gridSize: GRID_SIZE,
      cell: CELL,
      snake,
      food,
      headDirection: dir,
      timeMs,
    });
  }, []);

  const endGame = useCallback(() => {
    const finalScore = scoreRef.current;
    setPhase("gameover");
    if (!isMuted) {
      playDieSound();
    }
    if (finalScore > best) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.65 },
        colors: ["#c8f540", "#7c5cfc", "#f54060"],
      });
    }
    updateBest(finalScore);
  }, [best, isMuted, updateBest]);

  const tick = useCallback(() => {
    if (phaseRef.current !== "playing") return;
    const st = stateRef.current;
    const snake = st.snake;
    const { pending } = st;
    let { food, dir, eaten } = st;

    if (!opposite(dir, pending)) {
      dir = pending;
    }
    st.dir = dir;

    const head = snake[0];
    const next: Cell = { x: head.x + dir.dx, y: head.y + dir.dy };

    if (
      next.x < 0 ||
      next.x >= GRID_SIZE ||
      next.y < 0 ||
      next.y >= GRID_SIZE
    ) {
      endGame();
      return;
    }

    if (snake.slice(0, -1).some((s) => s.x === next.x && s.y === next.y)) {
      endGame();
      return;
    }

    const ate = next.x === food.x && next.y === food.y;
    let newSnake: Cell[];
    if (ate) {
      newSnake = [next, ...snake];
      eaten += 1;
      const newScore = scoreRef.current + POINTS_PER_FOOD;
      scoreRef.current = newScore;
      setScore(newScore);
      const lv = levelFromEaten(eaten);
      setLevel(lv);
      st.eaten = eaten;
      food = randomFood(newSnake);
      if (!isMuted) {
        playEatSound();
      }
    } else {
      newSnake = [next, ...snake.slice(0, -1)];
    }

    st.snake = newSnake;
    st.food = food;
  }, [endGame, isMuted]);

  useGameLoop(tick, phase === "playing" ? tickIntervalMs(level) : null);

  useKeyboard(
    (key) => {
      if (phaseRef.current !== "playing") return;
      const map: Record<string, Direction> = {
        ArrowUp: { dx: 0, dy: -1 },
        ArrowDown: { dx: 0, dy: 1 },
        ArrowLeft: { dx: -1, dy: 0 },
        ArrowRight: { dx: 1, dy: 0 },
        w: { dx: 0, dy: -1 },
        W: { dx: 0, dy: -1 },
        s: { dx: 0, dy: 1 },
        S: { dx: 0, dy: 1 },
        a: { dx: -1, dy: 0 },
        A: { dx: -1, dy: 0 },
        d: { dx: 1, dy: 0 },
        D: { dx: 1, dy: 0 },
      };
      const next = map[key];
      if (next) {
        stateRef.current.pending = next;
      }
    },
    phase === "playing",
  );

  useEffect(() => {
    draw();
  }, [draw, phase]);

  useEffect(() => {
    if (phase !== "playing") return;
    let id = 0;
    const loop = () => {
      draw();
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(id);
    };
  }, [draw, phase]);

  const startGame = () => {
    resumeAudio();
    const s0 = initialSnake();
    const f0 = randomFood(s0);
    stateRef.current = {
      snake: s0,
      food: f0,
      dir: { dx: 1, dy: 0 },
      pending: { dx: 1, dy: 0 },
      eaten: 0,
    };
    scoreRef.current = 0;
    setScore(0);
    setLevel(1);
    setPhase("playing");
  };

  const submitScore = async () => {
    const name = playerName.trim() || "Guest";
    if (score <= 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player_name: name,
          game_slug: "snake",
          score,
          level,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "FAILED");
      }
      toast.success(t("save_score_success"));
      await queryClient.invalidateQueries({ queryKey: ["leaderboard", "snake"] });
    } catch {
      toast.error(t("save_score_error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <label htmlFor="snake-player" className="font-mono text-xs text-muted-foreground">
            {t("player_name")}
          </label>
          <input
            id="snake-player"
            type="text"
            value={playerName}
            onChange={(e) => {
              setPlayerName(e.target.value);
            }}
            disabled={phase === "playing"}
            maxLength={24}
            className="w-full max-w-xs rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2 disabled:opacity-60"
            placeholder={t("player_placeholder")}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              toggleMute();
            }}
          >
            {isMuted ? t("unmute") : t("mute")}
          </Button>
          {phase === "idle" ? (
            <Button type="button" onClick={startGame}>
              {t("start")}
            </Button>
          ) : null}
          {phase === "gameover" ? (
            <Button type="button" onClick={startGame}>
              {t("play_again")}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="relative mx-auto w-full max-w-[min(92vw,420px)]">
          <GameCanvas
            ref={canvasRef}
            role="img"
            aria-label={t("canvas_label")}
            className="border-primary/25 shadow-[0_0_48px_-12px_rgba(200,255,64,0.22)] ring-1 ring-primary/15"
          />
          <AnimatePresence>
            {phase === "idle" ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-background/70"
              >
                <p className="font-[family-name:var(--font-syne)] text-lg font-semibold text-foreground">
                  {t("tap_start")}
                </p>
              </motion.div>
            ) : null}
            {phase === "gameover" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-card/95 p-6 text-center shadow-lg backdrop-blur-sm"
              >
                <p className="font-[family-name:var(--font-syne)] text-xl font-semibold text-foreground">
                  {t("game_over")}
                </p>
                <p className="font-mono text-3xl tabular-nums text-primary">
                  <CountUp end={score} duration={0.6} preserveValue />
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button type="button" onClick={startGame}>
                    {t("play_again")}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={submitting || score <= 0}
                    onClick={() => {
                      void submitScore();
                    }}
                  >
                    {t("submit_score")}
                  </Button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="flex min-w-[200px] flex-col gap-3 font-mono text-sm">
          <div className="flex justify-between gap-8 border-b border-border pb-2">
            <span className="text-muted-foreground">{t("score")}</span>
            <span className="tabular-nums text-primary">
              {phase === "playing" ? (
                <CountUp end={score} duration={0.35} preserveValue />
              ) : (
                score
              )}
            </span>
          </div>
          <div className="flex justify-between gap-8 border-b border-border pb-2">
            <span className="text-muted-foreground">{t("best")}</span>
            <span className="tabular-nums text-foreground">{best}</span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-muted-foreground">{t("level")}</span>
            <span className="tabular-nums text-foreground">{level}</span>
          </div>
          <p className="pt-2 text-xs text-muted-foreground">{t("controls_hint")}</p>
        </div>
      </div>
    </div>
  );
}
