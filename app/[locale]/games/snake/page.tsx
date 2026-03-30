import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import SnakeGame from "@/components/games/SnakeGame";
import { routing } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages" });
  return {
    title: t("snake_title"),
  };
}

export default async function SnakeGamePage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const tPage = await getTranslations("pages");
  const tGame = await getTranslations("game");

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-[family-name:var(--font-syne)] text-3xl font-semibold tracking-tight text-foreground">
          {tPage("snake_title")}
        </h1>
        <p className="max-w-2xl text-muted-foreground">{tGame("snake_intro")}</p>
      </header>
      <SnakeGame />
    </div>
  );
}
