"use client";

import { CheckIcon, LanguagesIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("locale");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label={t("label")}>
            <LanguagesIcon />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuLabel>{t("label")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {routing.locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => {
              router.replace(pathname, { locale: loc });
            }}
          >
            <span className="flex flex-1 items-center gap-2">
              {locale === loc ? (
                <CheckIcon className="size-4 text-primary" />
              ) : (
                <span className="size-4" aria-hidden />
              )}
              {t(loc)}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
