import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { ClientProviders } from "@/app/providers";

import "@/ui/theme.css";
import "leaflet/dist/leaflet.css";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const t = await getTranslations();
  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="bg-background text-foreground flex min-h-screen flex-col antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-100 focus:bg-background focus:p-2">
          {t("skipContent")}
        </a>
        <NextIntlClientProvider>
          <ClientProviders>{children}</ClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
