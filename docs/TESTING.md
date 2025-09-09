# Testing

This project uses **Vitest** with React Testing Library for unit and integration tests.

## Vitest configuration

- **Environment:** `jsdom` is used so components render in a browser-like DOM.
- **Path alias:** `@` resolves to the `src` directory, matching `tsconfig.json`.
- **Setup file:** [`config/vitest.setup.tsx`](../config/vitest.setup.tsx) sets global mocks and utilities. It imports `@testing-library/jest-dom`, mocks `focus-trap-react`, and sets the timezone to UTC.
- **Coverage:** `@vitest/coverage-v8` is used via `coverage: { provider: 'v8' }` in `config/vitest.config.ts`. Run with `npm run test:coverage`.

Tests are discovered from `tests/{unit,integration}/**/*.{test,spec}.{ts,tsx}`.

## Current strategy

Component unit tests live under `tests/unit` and focus on isolated modules. Integration tests reside in `tests/integration` and exercise interactions across features. Additional e2e coverage may be added once the app stabilizes.

## Folder and file naming

Test files use the `*.test.ts` or `*.test.tsx` pattern in `tests/unit` and the `*.spec.ts` or `*.spec.tsx` pattern in `tests/integration`, mirroring the source directory structure.

## Mocking guidelines

- **Global mocks:** put shared mocks in `vitest.setup.tsx` so all tests can rely on them.
- **Local mocks:** use `vi.mock()` inside individual test files when the behavior is specific to that test.
