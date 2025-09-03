# Testing

This project uses **Vitest** with React Testing Library for unit tests.

## Vitest configuration

- **Environment:** `jsdom` is used so components render in a browser-like DOM.
- **Path alias:** `@` resolves to the `src` directory, matching `tsconfig.json`.
- **Setup file:** [`vitest.setup.tsx`](../vitest.setup.tsx) sets global mocks and utilities. It imports `@testing-library/jest-dom`, mocks `focus-trap-react`, and sets the timezone to UTC.

Tests are discovered from `tests/{unit,integration}/**/*.{test,spec}.{ts,tsx}`.

## Current strategy

Only component unit tests exist today. Future work may add integration or e2e coverage once the app stabilizes. Integration tests will live under `tests/integration`.

## Folder and file naming

Test files use the `*.test.ts` or `*.test.tsx` pattern and live under `tests/unit`, mirroring the source directory structure.

## Mocking guidelines

- **Global mocks:** put shared mocks in `vitest.setup.tsx` so all tests can rely on them.
- **Local mocks:** use `vi.mock()` inside individual test files when the behavior is specific to that test.
