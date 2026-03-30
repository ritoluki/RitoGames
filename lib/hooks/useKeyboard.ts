import { useEffect, useRef } from "react";

/**
 * Subscribes to `keydown` while `enabled`. Handler receives normalized key id
 * (e.g. "ArrowUp", "w") — caller maps to actions.
 */
export function useKeyboard(
  onKey: (key: string) => void,
  enabled: boolean,
): void {
  const ref = useRef(onKey);
  ref.current = onKey;

  useEffect(() => {
    if (!enabled) return;
    const down = (e: KeyboardEvent) => {
      ref.current(e.key);
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [enabled]);
}
