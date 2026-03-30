import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import LeaderboardPanel from "@/components/portal/LeaderboardPanel";
import { routing } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "leaderboard" });
  return {
    title: t("title"),
  };
}

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
  const t = await getTranslations("leaderboard");

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-[family-name:var(--font-syne)] text-3xl font-semibold tracking-tight text-foreground">
          {t("title")}
        </h1>
      </header>
      <LeaderboardPanel />
    </div>
  );
}
