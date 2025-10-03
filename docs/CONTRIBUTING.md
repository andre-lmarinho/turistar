# Contributing Guide

Thank you for taking the time to contribute to Turistar! This document outlines the development conventions for the project so that all contributions are consistent and easy to review.

## Branches and Commit Messages

- Use short branch names starting with a type, for example `feature/*`, `fix/*` or `chore/*`.
- Write clear, present-tense commit messages that summarize the change.
- Squash commits before merging so the main branch history stays tidy.

### Sample Commit Messages

Examples of helpful commit messages:

- `Add date picker to planner`
- `Fix timezone calculation`
- `Update contribution guidelines`

## Pull Requests

- Use the pull request template.
  - Provide a short overview in Summary.
  - Copy the Summary text verbatim into Description and expand if needed.
- Commit suggestions after merging should follow the same clarity guidelines.

## Linting and Formatting

Before opening a pull request, ensure the code passes Prettier and ESLint checks:

```bash
npm run format
npm run lint
```

Formatting uses Prettier with semicolons and single quotes. The formatter now targets common project file types via a single glob and respects `.prettierignore` for generated assets. ESLint enforces the project's TypeScript and React rules and will fail on any warnings, so address them before committing.

- Run `npm run typecheck` before committing to verify type safety.

## Running Tests

Unit tests run with [Vitest](https://vitest.dev/). Execute them with:

```bash
npm run test
```

Use `npm run test:watch` for watch mode or `npm run test:coverage` to produce coverage reports.

### Coverage uploads (Codecov)

- Coverage reports are written to the `coverage/` directory, including `coverage/lcov.info` for Codecov.
- The CI workflow uploads these reports as artifacts and forwards the LCOV file to Codecov when `CODECOV_TOKEN` is configured.
- For private forks, create or import the repository in Codecov and copy the value from **Settings → General → Upload token**, then add it as a `CODECOV_TOKEN` secret in your forked repository.

## Storybook

The repository does not yet include a Storybook setup. When one is added, you will typically start it with:

```bash
npm run storybook
```

## Local Documentation

Developer documentation lives inside the `docs` folder. There is no automated docs site yet, so open the Markdown files directly or generate your own from them.

---

Happy coding!

## Toolchain updates

- The required Node.js version is pinned in `.nvmrc`, and the CI workflow reads that file. When upgrading Node, update `.nvmrc` and the `engines.node` field in `package.json` together and verify `nvm use` succeeds locally.
