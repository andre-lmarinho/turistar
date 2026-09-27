# Internationalization

UI translations use `next-intl`. Supported locales are `en` and `pt-BR`; changing language keeps the current URL.

## How it works

1. [request.ts](request.ts) chooses a valid `turistar_locale` cookie, then an `Accept-Language` match, then `en`. [config.ts](config.ts) defines supported locales and resolves browser preferences.
2. The [root layout](../app/layout.tsx) sets `html lang` and provides the active catalog through `NextIntlClientProvider`.
3. [LanguageSelect](../modules/auth/components/LanguageSelect.tsx) calls [setLocale](actions.ts), which validates the locale and writes a cookie lasting one year.

The preference belongs to the browser, including shared demo accounts. Tabs in one browser profile share the stored preference; devices do not.

## Adding translations

- Add matching keys to [en.json](locales/en.json) and [pt-BR.json](locales/pt-BR.json). [types.d.ts](types.d.ts) uses the English catalog to type message keys.
- Use `useTranslations()` in client components and `getTranslations()` in server components.
- Keep complete sentences in messages. Use parameters and plurals instead of concatenating translated fragments.
- For a new locale, update `config.ts`, the catalog loaders in `request.ts`, the selector, and the catalog tests.

Language does not determine a trip's currency or time zone. Translation coverage is still incomplete: [BudgetView](../modules/planner/views/BudgetView.tsx) contains fixed dollar and `en-US` formatting, and the legal pages are English-only.

## Verification

[config.test.ts](config.test.ts) checks locale resolution, matching catalog keys, and nonempty translations. [actions.test.ts](actions.test.ts) covers preference writes, and [auth translation tests](../modules/auth/auth-translations.test.tsx) check translated forms and language changes.

See [contribution checks](../../CONTRIBUTING.md#checks) for test commands and the [architecture overview](../../ARCHITECTURE.md) for application context.
