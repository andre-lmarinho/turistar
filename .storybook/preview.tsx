import type { Preview } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { useState } from "react";

import enMessages from "../src/i18n/locales/en.json";
import ptBrMessages from "../src/i18n/locales/pt-BR.json";
import "../src/ui/theme.css";

type Locale = "en" | "pt-BR";

function Providers({ children, locale }: { children: ReactNode; locale: Locale }) {
  const [queryClient] = useState(() => new QueryClient());
  const messages = locale === "pt-BR" ? ptBrMessages : enMessages;

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </NextIntlClientProvider>
  );
}

const preview: Preview = {
  globalTypes: {
    locale: {
      description: "Screen language",
      toolbar: {
        title: "Language",
        icon: "globe",
        items: [
          { value: "en", title: "English" },
          { value: "pt-BR", title: "Português (Brasil)" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { locale: "en" },
  decorators: [
    (Story, context) => (
      <Providers locale={context.globals.locale === "pt-BR" ? "pt-BR" : "en"}>
        <Story />
      </Providers>
    ),
  ],
};

export default preview;
