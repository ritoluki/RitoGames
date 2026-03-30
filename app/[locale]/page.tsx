import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import GameGrid from "@/components/portal/GameGrid";
import { routing } from "@/i18n/routing";

export default async function HomePage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <div className="flex flex-col gap-12">
      <section className="space-y-4 text-center sm:text-left">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#c8f540]">
          {t("hero_tag")}
        </p>
        <h1 className="font-[family-name:var(--font-syne)] text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {t("hero_title")}
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">{t("hero_desc")}</p>
      </section>

      <section aria-labelledby="games-heading" className="space-y-6">
        <h2
          id="games-heading"
          className="font-[family-name:var(--font-syne)] text-2xl font-semibold text-foreground"
        >
          {t("games_heading")}
        </h2>
        <GameGrid />
      </section>
    </div>
  );
}
