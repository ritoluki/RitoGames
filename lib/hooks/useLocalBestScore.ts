"use client";

import { useCallback, useEffect, useState } from "react";

import type { GameSlug } from "@/types/game";

function storageKey(slug: GameSlug): string {
  return `arcadia-best-${slug}`;
}

export function useLocalBestScore(gameSlug: GameSlug): {
  best: number;
  updateBest: (score: number) => void;
} {
  const [best, setBest] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(gameSlug));
      if (raw !== null) {
        const n = Number.parseInt(raw, 10);
        if (!Number.isNaN(n) && n >= 0) {
          setBest(n);
        }
      }
    } catch {
      /* ignore */
    }
  }, [gameSlug]);

  const updateBest = useCallback(
    (score: number) => {
      setBest((prev) => {
        const next = Math.max(prev, score);
        try {
          localStorage.setItem(storageKey(gameSlug), String(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [gameSlug],
  );

  return { best, updateBest };
}
