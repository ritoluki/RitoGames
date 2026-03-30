import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

import LocaleSwitcher from "./LocaleSwitcher";

export default async function Header() {
  const t = await getTranslations("nav");

  return (
    <header className="border-b border-border/80 bg-card/40 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="font-[family-name:var(--font-syne)] text-lg font-semibold tracking-tight text-foreground"
        >
          {t("brand")}
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {t("games")}
          </Link>
          <Link
            href="/leaderboard"
            className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {t("leaderboard")}
          </Link>
          <Link
            href="/about"
            className="hidden rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
          >
            {t("about")}
          </Link>
          <LocaleSwitcher />
        </nav>
      </div>
    </header>
  );
}
