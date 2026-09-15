import { describe, expect, it } from "vitest";
import { MIN_PASSWORD_LENGTH } from "@/features/auth/utils/validPassword";
import { resolveLocale } from "./config";
import en from "./locales/en.json";
import pt from "./locales/pt-BR.json";

describe("interface locale", () => {
  it("keeps the password minimum in both catalogs aligned with validation", () => {
    for (const catalog of [en, pt]) {
      expect(catalog.passwordMinLength.match(/\d+/g)).toEqual([String(MIN_PASSWORD_LENGTH)]);
      expect(catalog.passwordMinLength).not.toContain("{count}");
    }
  });

  it.each([
    ["pt-BR", "en", "pt-BR"],
    ["en", "pt-BR", "en"],
    ["invalid", "pt-PT", "pt-BR"],
    [undefined, "fr,pt;q=0.8,en;q=0.5", "pt-BR"],
    [undefined, "pt;q=0,en-GB;q=0.8", "en"],
    [undefined, "pt;Q=0,en;q=0.5", "en"],
    [undefined, "pt;q=invalid,en", "en"],
    [undefined, "pt;q=0.2,en;q=0.9", "en"],
    [undefined, null, "en"],
    [undefined, "fr", "en"],
  ])("resolves %s / %s to %s", (cookie, header, expected) => {
    expect(resolveLocale(cookie, header)).toBe(expected);
  });
  it("ships the same nonempty message keys in both catalogs", () => {
    expect(Object.keys(pt)).toEqual(Object.keys(en));
    for (const catalog of [en, pt]) {
      expect(Object.values(catalog).every((message) => message.trim().length > 0)).toBe(true);
    }
  });
});
