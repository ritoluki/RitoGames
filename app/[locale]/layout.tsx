import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Space_Mono, Syne } from "next/font/google";
import { notFound } from "next/navigation";

import AppProviders from "@/components/providers/app-providers";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { routing } from "@/i18n/routing";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <body
        className={`${syne.variable} ${spaceMono.variable} flex min-h-screen flex-col bg-background font-sans antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <AppProviders>
            <Header />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
              {children}
            </main>
            <Footer />
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
