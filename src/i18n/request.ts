import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { localeCookie, resolveLocale } from "./config";

const catalogs = {
  en: () => import("./locales/en.json"),
  "pt-BR": () => import("./locales/pt-BR.json"),
};

export default getRequestConfig(async () => {
  const store = await cookies();
  const locale = resolveLocale(store.get(localeCookie)?.value, (await headers()).get("accept-language"));
  return { locale, messages: (await catalogs[locale]()).default };
});
