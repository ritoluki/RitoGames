"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GAMES } from "@/lib/games";
import { useLeaderboardQuery } from "@/lib/hooks/useLeaderboard";
import type { GameSlug } from "@/types/game";
import type { ScoreRow } from "@/types/score";

export default function LeaderboardPanel() {
  const [game, setGame] = useState<GameSlug>("snake");
  const t = useTranslations("leaderboard");
  const tGames = useTranslations("games");
  const format = useFormatter();
  const { data: rows, isLoading, isError, error, refetch, isFetching } =
    useLeaderboardQuery(game);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label={t("game_filter")}>
          {GAMES.map((g) => (
            <Button
              key={g.slug}
              type="button"
              variant={game === g.slug ? "default" : "outline"}
              size="sm"
              className="gap-1.5"
              onClick={() => {
                setGame(g.slug);
              }}
              aria-pressed={game === g.slug}
            >
              <span aria-hidden>{g.icon}</span>
              {tGames(`${g.slug}.name`)}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-border bg-card/50 px-4 py-12 text-center font-mono text-sm text-muted-foreground">
          {t("loading")}
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-8 text-center">
          <p className="text-sm text-destructive">
            {t("error", { code: error?.message ?? "UNKNOWN" })}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              void refetch();
            }}
          >
            {t("retry")}
          </Button>
        </div>
      ) : null}

      {!isLoading && !isError ? (
        <LeaderboardTable rows={rows ?? []} isFetching={isFetching} format={format} />
      ) : null}
    </div>
  );
}

function LeaderboardTable({
  rows,
  isFetching,
  format,
}: Readonly<{
  rows: ScoreRow[];
  isFetching: boolean;
  format: ReturnType<typeof useFormatter>;
}>) {
  const t = useTranslations("leaderboard");
  return (
    <div className="space-y-2">
      {isFetching ? (
        <p className="font-mono text-xs text-muted-foreground">{t("refreshing")}</p>
      ) : null}
      <div className="rounded-xl border border-border bg-card/40">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12 font-mono text-xs uppercase tracking-wide text-muted-foreground">
                {t("rank")}
              </TableHead>
              <TableHead className="font-[family-name:var(--font-syne)]">
                {t("player")}
              </TableHead>
              <TableHead className="text-right font-mono text-xs uppercase tracking-wide text-muted-foreground">
                {t("score")}
              </TableHead>
              <TableHead className="hidden text-right font-mono text-xs uppercase tracking-wide text-muted-foreground sm:table-cell">
                {t("level")}
              </TableHead>
              <TableHead className="hidden text-right font-mono text-xs uppercase tracking-wide text-muted-foreground md:table-cell">
                {t("date")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  {t("empty")}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="max-w-[10rem] truncate font-medium sm:max-w-none">
                    {row.player_name}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-primary">
                    {format.number(row.score)}
                  </TableCell>
                  <TableCell className="hidden text-right font-mono tabular-nums sm:table-cell">
                    {format.number(row.level)}
                  </TableCell>
                  <TableCell className="hidden text-right font-mono text-xs text-muted-foreground md:table-cell">
                    {format.dateTime(new Date(row.created_at), {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
