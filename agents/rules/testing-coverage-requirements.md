---
title: Test Behavior and Maintain Coverage
impact: HIGH
impactDescription: Checks changed behavior and guards against regressions
tags: testing, coverage, quality, ci
---

# Test behavior and maintain coverage

Every PR must test the behavior it introduces or modifies. Prioritize authorization, data boundaries, failure paths, and other behavior that could regress. Coverage is a useful signal; assertions must still verify meaningful outcomes.

- Vitest tests use `.test.ts` or `.test.tsx` under `src/` or `tests/`.
- Playwright tests live in `tests/e2e/` and exercise browser flows using the project's E2E fixtures and mock mode.
- CI enables Vitest coverage and enforces the thresholds in [vitest.config.ts](../../vitest.config.ts). Its include pattern covers production source files even when tests do not import them.
- Keep the coverage floor passing and raise it deliberately as coverage improves.
- Run checks relevant to the change and report their results in the PR.

Use the [focused test commands](../../CONTRIBUTING.md#checks). Follow [AGENTS.md](../../AGENTS.md) for required type checks and permission before full builds or E2E suites.
