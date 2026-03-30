import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { routing } from "@/i18n/routing";

export default async function LeaderboardPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const t = await getTranslations("pages");

  return (
    <div className="space-y-4">
      <h1 className="font-[family-name:var(--font-syne)] text-3xl font-semibold text-foreground">
        {t("leaderboard_title")}
      </h1>
      <p className="max-w-xl text-muted-foreground">{t("leaderboard_body")}</p>
    </div>
  );
}
