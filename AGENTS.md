<!-- intent-skills:start -->
## Skill Loading

Before editing files for a substantial task:
- Run `pnpm dlx @tanstack/intent@latest list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `pnpm dlx @tanstack/intent@latest load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->

# Turistar Agent Guide

Work in this pnpm-managed Next.js application with type safety, security, and small, reviewable diffs.

## Project documentation

- [README](README.md): product overview and entry points.
- [Architecture](ARCHITECTURE.md): code ownership, request flow, and data model.
- [Contributing](CONTRIBUTING.md): setup, commands, database workflow, and PRs.
- [Engineering rules](agents/rules/README.md): repository-specific implementation guidance.

Routes live in `src/app/`, domain code in `src/features/`, composed screens in `src/modules/`, tRPC in `src/trpc/`, shared UI in `src/ui/`, and utilities in `src/lib/`. Database migrations live in `supabase/migrations/`; `supabase/schema.supabase.sql` is a context snapshot, not an executable setup script.

## Implementation rules

- Follow the [repository rules](agents/rules/README.md).
- Use explicit column selection in Supabase queries; avoid `select('*')`.
- Keep business logic in Services and data access in Repositories.
- Use `import type { X }` for TypeScript type imports.
- Import directly from source files, never from `index.ts` barrels. For example: `@/ui/components/button/Button`.
- Use early returns to reduce nesting.
- Include the operation and relevant identifiers in descriptive errors.
- Use `date-fns` or native `Date` instead of Day.js.
- Put permission checks in `page.tsx`, never in `layout.tsx`. Follow the [authorization rule](agents/rules/architecture-page-level-auth.md) for Services and protected entry points.
- Use `ast-grep` for searching if available; otherwise use `rg`, then `grep`.

## Checks and pull requests

- Run `pnpm typecheck:ci` for changed code. It checks the whole project, including route type generation.
- Run relevant tests and Biome checks; use the [focused commands](CONTRIBUTING.md#checks) while iterating.
- Ensure `pnpm lint`, type checking, and relevant tests pass before opening a PR.
- Never skip type checks before pushing. Run `pnpm typecheck:ci` before concluding CI failures are unrelated to your changes.
- Use conventional commits and PR titles, such as `feat(scope): description`, `fix:`, or `refactor:`.
- Create PRs in draft mode by default.
- Never create a PR with more than 500 changed lines or 10 files; split it into smaller PRs.
- Use the [PR template](.github/PULL_REQUEST_TEMPLATE.md) and verify that no secrets or API keys are included.

## Boundaries

### Ask first

- Adding new dependencies.
- Schema changes, including changes to `supabase/schema.supabase.sql`.
- Changes affecting multiple features.
- Deleting files.
- Running full build or E2E suites.

### Never do

- Use `as any` casts.
- Commit secrets, API keys, or `.env` files.
- Expose `SUPABASE_SERVICE_ROLE_KEY` client-side, in logs, or in any query.
- Force push or rebase shared branches.
- Modify generated files directly.

## When stuck

- Ask for clarification before making large speculative changes.
- Propose a short plan for complex tasks.
- Open a draft PR with notes if unsure about the approach.
- Fix type errors before test failures; they are often the root cause.
- For missing database enums or types, regenerate types using the [database workflow](CONTRIBUTING.md#database-workflow) and restart the TypeScript server.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
