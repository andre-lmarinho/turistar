import type { Preview } from "@storybook/nextjs-vite";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { TRPCProvider } from "../src/app/_trpc/trpc-provider";

import enMessages from "../src/i18n/locales/en.json";
import ptBrMessages from "../src/i18n/locales/pt-BR.json";
import "leaflet/dist/leaflet.css";
import "../src/ui/theme.css";

type Locale = "en" | "pt-BR";

function Providers({ children, locale }: { children: ReactNode; locale: Locale }) {
  const messages = locale === "pt-BR" ? ptBrMessages : enMessages;

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
      <TRPCProvider>{children}</TRPCProvider>
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
  parameters: { nextjs: { appDirectory: true } },
  decorators: [
    (Story, context) => (
      <Providers locale={context.globals.locale === "pt-BR" ? "pt-BR" : "en"}>
        <Story />
      </Providers>
    ),
  ],
};

export default preview;
