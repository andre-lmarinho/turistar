# Internationalization

UI translations use `next-intl` with the existing URLs. Supported locales are `en` and `pt-BR`.

## How it works

1. `request.ts` chooses a valid `turistar_locale` cookie, then `Accept-Language`, then `en`.
2. The root layout sets `html lang` and provides the active catalog.
3. `LanguageSelect` calls `setLocale`, which validates and writes the cookie.

The preference belongs to the browser, including shared demo accounts. Tabs in one browser profile share it; devices do not.

## Adding translations

- Add matching keys to `locales/en.json` and `locales/pt-BR.json`.
- Use `useTranslations()` in client components and `getTranslations()` in server components.
- Keep complete sentences in messages. Use parameters and plurals instead of concatenating translated fragments.
- Add new locales to `config.ts`, the catalog loaders, and the selector.

## Current scope

The login flow, skip link and language selector are translated. Other screens remain in English until migrated.

There are no localized routes, SEO changes, database fields, or demo-specific language rules. Locale does not change a trip's currency, dates, or time zone.

## Verification

```sh
pnpm exec vitest run src/i18n/config.test.ts src/i18n/actions.test.ts
pnpm exec playwright test tests/e2e/i18n.spec.ts
pnpm typecheck:ci
```
