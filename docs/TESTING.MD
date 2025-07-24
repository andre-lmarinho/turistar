# Testing

This project uses **Vitest** with React Testing Library for unit tests.

## Vitest configuration

- **Environment:** `jsdom` is used so components render in a browser-like DOM.
- **Path alias:** `@` resolves to the `src` directory, matching `tsconfig.json`.
- **Setup file:** [`vitest.setup.tsx`](../vitest.setup.tsx) sets global mocks and utilities. It imports `@testing-library/jest-dom`, mocks `focus-trap-react`, and sets the timezone to UTC.

Tests are discovered from `src/**/*.{test,spec}.{ts,tsx}`.

## Current strategy

Only component unit tests exist today. Future work may add integration or e2e coverage once the app stabilises.

## Folder and file naming

Test files use the `*.test.tsx` pattern and live next to the source they cover. This keeps implementation and tests close together.

## Mocking guidelines

- **Global mocks:** put shared mocks in `vitest.setup.tsx` so all tests can rely on them.
- **Local mocks:** use `vi.mock()` inside individual test files when the behaviour is specific to that test.
