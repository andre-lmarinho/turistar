# Contributing

Start with the [README](README.md) for the product overview and [Architecture](ARCHITECTURE.md) for the
system model. This guide covers development, checks, and repository maintenance.

## Local development

### Prerequisites

- Node.js matching [`.nvmrc`](.nvmrc); supported versions are declared in [`package.json`](package.json).
- pnpm matching `packageManager` in `package.json`.
- [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) available as
  `supabase` on your PATH. It is not installed by this repository's `pnpm install`.
- A running Docker-compatible container runtime for local Supabase.

### Setup

From the repository root:

```sh
pnpm install
cp .env.example .env.local
supabase start
```

Complete [Configuration](#configuration), then run:

```sh
pnpm dev
```

This starts or reuses Supabase, applies pending local migrations, and starts Next.js. Use
[http://127.0.0.1:3000](http://127.0.0.1:3000) to match the Auth origin in
[`supabase/config.toml`](supabase/config.toml). Local Studio runs on port 54323; captured emails are
available on port 54324. Local email confirmation is disabled in the checked-in configuration.

Create an account or use the demo entry on the auth screens. The seed creates the shared demo account
and trips. If an existing local database lacks seed data, the [reset command](#database-workflow)
recreates it and removes local changes.

### Common setup issues

| Symptom | Check |
| --- | --- |
| `supabase` is missing or cannot start containers | Install the CLI and start the container runtime. |
| Username availability fails | Set the local `SUPABASE_SERVICE_ROLE_KEY` and restart Next.js. |
| Place search or map tiles fail | Set `GEOAPIFY_KEY` or `CARTO_KEY`, respectively. |
| Auth emails return to the wrong origin | Match the browser origin with Supabase's site URL and allowed redirects. |
| Database objects are missing | Run `pnpm db:migrate`; use a reset only if local data can be discarded. |

## Configuration

Copy [`.env.example`](.env.example) and edit `.env.local`. Obtain local Supabase values with:

```sh
supabase status -o env
```

This command includes credentials. Copy the needed values into `.env.local`; keep the output out of
logs, issues, and commits. Use the key from your running local stack, not a hosted project's key.

| Variable | Used for |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser and server connection to Supabase. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public client key; row access is controlled by the viewer's session and RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only username availability lookup with privileged access. |
| `GEOAPIFY_KEY` | Server-side destination search, place details, and geocoding. |
| `CARTO_KEY` | Server-side map tile requests. |
| `NEXT_PUBLIC_POSTHUG_PROJECT_TOKEN` | Optional browser analytics; leave blank to disable. The spelling matches the code. |
| `NEXT_PUBLIC_POSTHUG_HOST` | Optional analytics endpoint read by the current provider. |
| `NEXT_PUBLIC_SITE_URL` | Explicit server-side URL origin for absolute links where the URL helper is used. |

The example file lists `NEXT_PUBLIC_POSTHOG_HOST`, but the current
[provider](src/lib/analytics/PostHogProvider.tsx) reads `NEXT_PUBLIC_POSTHUG_HOST`; use the latter when
configuring a host. Production SEO metadata uses a separate fixed origin in
[`siteUrl.ts`](src/lib/urls/siteUrl.ts). Changing `NEXT_PUBLIC_SITE_URL` alone does not replace it.

Restart Next.js after changing environment variables. Never expose the service-role key through a
`NEXT_PUBLIC_` variable. Keep analytics disabled for local work unless you need to verify it.

## Checks

The scripts in [`package.json`](package.json) are the command reference. The usual checks are:

```sh
pnpm lint
pnpm typecheck:ci
pnpm test
```

`typecheck:ci` generates Next.js route types and checks the whole TypeScript project. Biome handles
supported source formats; Markdown still needs a review of links, examples, and factual accuracy.

For a focused unit suite or source-file check:

```sh
pnpm exec vitest run src/features/plan/services/PlanService.test.ts
pnpm exec biome check src/features/plan/services/PlanService.ts
```

Use `pnpm exec vitest run <path>` for file selection. Unit and component tests live alongside source as
`.test.ts` or `.test.tsx`. [`vitest.config.ts`](vitest.config.ts) enables coverage when `CI=true` and
sets the enforced thresholds. The [CI workflow](.github/workflows/ci.yml) runs lint, types, unit tests,
a production build, and browser tests.

### Browser tests

Install the browser once, then select the relevant suite:

```sh
pnpm exec playwright install chromium
pnpm exec playwright test tests/e2e/planner-core.spec.ts
```

[`playwright.config.ts`](playwright.config.ts) starts `pnpm dev:e2e` on port 3100 by default. This mode
uses mocked Supabase data and does not start the local database. It verifies UI flows; it does not
validate real RLS policies, RPC behavior, or Realtime delivery. Those changes also need verification
against a local database or preview. `pnpm e2e` runs the full browser suite.

Coding agents must follow the [execution boundaries](AGENTS.md#boundaries) before running a full build
or E2E suite.

## Database workflow

The executable schema lives in [`supabase/migrations`](supabase/migrations).
[`supabase/schema.supabase.sql`](supabase/schema.supabase.sql) is a context-only table reference.

| Command | Effect |
| --- | --- |
| `pnpm db:migrate` | Apply pending migrations without resetting the local database. Review migrations for changes to existing data. |
| `pnpm db:reset` | Recreate the local database, apply migrations, and run `supabase/seed.sql`. Deletes local data. |
| `pnpm db:stop` | Stop local Supabase while preserving its data. |

For database changes, follow the repository's [approval boundaries](AGENTS.md#boundaries), create a
versioned migration with the Supabase CLI, and verify it locally. The
[migration workflow](.github/workflows/supabase-migrations.yml) checks that migrations and seed data
can rebuild the database and pass `supabase db lint`.

After an approved schema change, regenerate the public types from the intended database. For local
Supabase:

```sh
supabase gen types --local --lang typescript --schema public > src/supabase/types.ts
pnpm typecheck:ci
```

Do not edit generated types by hand. The existing `pnpm gen:types` script does not specify a database
target; the explicit `--local` command above removes that ambiguity for local development.

## Pull requests

- Use a conventional title, such as `docs: clarify planner synchronization`.
- Open PRs as drafts and keep each within 500 changed lines and 10 files; split larger work into
  reviewable parts.
- Explain the resulting behavior and report the checks actually run, using the
  [PR template](.github/PULL_REQUEST_TEMPLATE.md).
- Keep secrets, `.env` files, generated build artifacts, and unrelated changes out of the diff.
- Update documentation when changing a workflow, command, or public behavior.

### Documentation style

Write repository documentation in English. Keep the root README focused on orientation, and place
shared explanations in this guide or the architecture guide. Local READMEs should describe their
responsibility, important behavior, and a few linked entry points. Use relative links, preserve useful
limitations and design decisions, and avoid copying function catalogs or version lists from source.

## Deployment

`pnpm build` creates the production application and `pnpm start` serves it locally. The existing
`pnpm vercel:pull` and `pnpm vercel:build` scripts fetch preview project settings and build through the
Vercel CLI; they require access to the linked Vercel project. `VERCEL_TOKEN` is only needed when using
non-interactive Vercel authentication.

Configure hosted Supabase, provider keys, and Auth redirect URLs for the target environment. Apply
required migrations through the chosen deployment process; the migration CI job validates a local
rebuild and does not deploy the hosted database. For another public domain, review both the URL helper
and the fixed production SEO origin described under [Configuration](#configuration).

`GET /health` returns an application status and version. It is a process health check and does not
probe the database or external services.
