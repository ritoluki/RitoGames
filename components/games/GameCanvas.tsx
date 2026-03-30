"use client";

import { forwardRef, type ComponentProps } from "react";

import { cn } from "@/lib/utils";

const GameCanvas = forwardRef<
  HTMLCanvasElement,
  Readonly<ComponentProps<"canvas">>
>(({ className, ...props }, ref) => {
  return (
    <canvas
      ref={ref}
      className={cn(
        "h-auto w-full max-w-[min(92vw,420px)] touch-none rounded-xl border border-border bg-card/30",
        className,
      )}
      {...props}
    />
  );
});

GameCanvas.displayName = "GameCanvas";

export default GameCanvas;
