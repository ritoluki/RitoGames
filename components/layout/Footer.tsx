import { getTranslations } from "next-intl/server";

export default async function Footer() {
  const t = await getTranslations("footer");

  return (
    <footer className="mt-auto border-t border-border/80 py-8 text-center">
      <p className="font-mono text-xs text-muted-foreground">{t("tagline")}</p>
    </footer>
  );
}
