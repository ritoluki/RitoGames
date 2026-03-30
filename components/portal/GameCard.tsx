"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";

import { Button, buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { GameMeta } from "@/types/game";

import { cn } from "@/lib/utils";

const colorRing: Record<GameMeta["color"], string> = {
  green: "ring-[#c8f540]/30 hover:shadow-[0_0_24px_-4px_rgba(200,245,64,0.35)]",
  red: "ring-[#f54060]/25 hover:shadow-[0_0_24px_-4px_rgba(245,64,96,0.3)]",
  purple: "ring-[#7c5cfc]/25 hover:shadow-[0_0_24px_-4px_rgba(124,92,252,0.3)]",
  orange: "ring-orange-400/25 hover:shadow-[0_0_24px_-4px_rgba(251,146,60,0.3)]",
};

export default function GameCard({
  game,
  index = 0,
}: Readonly<{ game: GameMeta; index?: number }>) {
  const tGames = useTranslations("games");
  const tCommon = useTranslations("common");
  const title = tGames(`${game.slug}.name`);
  const description = tGames(`${game.slug}.desc`);
  const isLive = game.status === "live";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className={cn(
        "rounded-xl border border-border bg-card p-5 ring-1 transition-shadow",
        colorRing[game.color],
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="text-3xl" aria-hidden>
          {game.icon}
        </span>
        {!isLive ? (
          <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
            {tCommon("coming_soon")}
          </span>
        ) : null}
      </div>
      <h3 className="font-[family-name:var(--font-syne)] text-lg font-semibold text-foreground">
        {title}
      </h3>
      <p className="mt-1 line-clamp-2 font-mono text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
      <div className="mt-4">
        {isLive ? (
          <Link
            href={`/games/${game.slug}`}
            className={cn(buttonVariants({ variant: "default", size: "default" }))}
          >
            {tCommon("play")}
          </Link>
        ) : (
          <Button disabled variant="secondary">
            {tCommon("coming_soon")}
          </Button>
        )}
      </div>
    </motion.article>
  );
}
