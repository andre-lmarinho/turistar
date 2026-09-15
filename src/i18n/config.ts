export const locales = ["en", "pt-BR"] as const;
export type Locale = (typeof locales)[number];
export const localeCookie = "turistar_locale";
export function isLocale(value: unknown): value is Locale {
  return locales.some((locale) => locale === value);
}

export function resolveLocale(cookie: unknown, acceptLanguage: string | null): Locale {
  if (isLocale(cookie)) return cookie;
  const preferences = (acceptLanguage ?? "")
    .split(",")
    .map((entry) => {
      const [tag, ...parameters] = entry.trim().split(";");
      const quality = parameters.find((parameter) => parameter.trim().startsWith("q="));
      const weight = quality === undefined ? 1 : Number(quality.trim().slice(2));
      return { tag: tag.toLowerCase(), weight };
    })
    .filter(({ weight }) => Number.isFinite(weight) && weight > 0 && weight <= 1)
    .sort((a, b) => b.weight - a.weight);
  for (const { tag } of preferences) {
    if (/^en(?:-[a-z0-9]+)*$/.test(tag)) return "en";
    if (/^pt(?:-[a-z0-9]+)*$/.test(tag)) return "pt-BR";
  }
  return "en";
}
