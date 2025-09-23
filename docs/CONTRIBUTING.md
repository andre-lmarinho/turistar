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

Formatting uses Prettier with semicolons and single quotes; ESLint enforces the project's TypeScript and React rules.

- Run `npm run typecheck` before committing to verify type safety.

## Running Tests

Unit tests run with [Vitest](https://vitest.dev/). Execute them with:

```bash
npm run test
```

Use `npm run test:watch` for watch mode or `npm run test:coverage` to produce coverage reports.

## Storybook

The repository does not yet include a Storybook setup. When one is added, you will typically start it with:

```bash
npm run storybook
```

## Local Documentation

Developer documentation lives inside the `docs` folder. There is no automated docs site yet, so open the Markdown files directly or generate your own from them.

---

Happy coding!
