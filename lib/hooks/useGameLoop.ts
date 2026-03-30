import { useEffect, useRef } from "react";

/**
 * Runs `callback` on a fixed interval while `delayMs` is not null.
 * Callback always sees latest closure via ref (safe for game ticks).
 */
export function useGameLoop(callback: () => void, delayMs: number | null) {
  const saved = useRef(callback);
  saved.current = callback;

  useEffect(() => {
    if (delayMs === null) return;
    const id = window.setInterval(() => {
      saved.current();
    }, delayMs);
    return () => window.clearInterval(id);
  }, [delayMs]);
}
