# Infrastructure

This guide maps the infrastructure visible in the repository. For application data flows and access
rules, see [Architecture](ARCHITECTURE.md). For setup and commands, see
[Contributing](CONTRIBUTING.md).

## Runtime

Turistar runs as one Next.js application. The browser loads pages and calls the application's tRPC
and HTTP endpoints. Server code uses Supabase for authenticated data access. The browser also uses
Supabase Auth and subscribes to itinerary events through Supabase Realtime.

| Dependency                   | Purpose                                                        | When unavailable                                                                                           |
| ---------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Supabase Auth and PostgreSQL | Sessions, plans, profiles, permissions, events, and snapshots. | Authentication and persistent data operations depend on these services.                                    |
| Supabase Realtime            | Delivers itinerary events to connected editors.                | Reconnect and history recovery are described in [Events](src/features/events/README.md#realtime-recovery). |
| Geoapify                     | Place search, details, and geocoding through server endpoints. | Place search and related lookups cannot work.                                                              |
| CARTO                        | Map tiles through the server's tile proxy.                     | The map cannot load those tiles.                                                                           |
| Wikidata                     | Optional image lookup during plan creation.                    | A lookup may not supply a cover image.                                                                     |
| PostHog                      | Optional browser analytics.                                    | Analytics is disabled when the project token is absent.                                                    |

See [Configuration](CONTRIBUTING.md#configuration) for variable names and the known analytics host
name mismatch. Do not put the Supabase service-role key in browser code or logs.

## Local environment

[`supabase/config.toml`](supabase/config.toml) defines the local stack. The API uses port 54321, the
database 54322, Studio 54323, and the email test interface 54324. The configured PostgreSQL major
version is 17. Local Supabase runs in containers; the Next.js process runs separately.

`pnpm dev` starts or reuses Supabase, applies pending local migrations, then starts Next.js. A database
reset rebuilds from the migrations and seed but deletes local data. Follow
[Local development](CONTRIBUTING.md#local-development) for setup and
[Database workflow](CONTRIBUTING.md#database-workflow) before changing the schema.

## CI and releases

| Workflow                                                           | Trigger                            | What it checks or changes                                                                            |
| ------------------------------------------------------------------ | ---------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [CI](.github/workflows/ci.yml)                                     | Pull requests and pushes to `main` | Runs lint, type checking, unit tests, a build, and browser tests in separate jobs.                   |
| [Database Integration](.github/workflows/database-integration.yml) | Pull requests                      | Rebuilds a disposable local database from migrations and seed, lints it, and runs integration tests. |
| [Release](.github/workflows/release.yml)                           | Pushes to `main`                   | Uses the version in `package.json` to create or recover a GitHub release when needed.                |

Browser tests use mocked Supabase data. Database integration tests use local Supabase but exclude
Realtime and several other services. Neither suite alone proves the complete hosted system works.
See [Checks](CONTRIBUTING.md#checks) for commands and coverage limits.

## Deployment and health

The repository includes scripts to pull preview settings and build with the Vercel CLI. It does not
establish which hosted Vercel project, Supabase project, domains, or credentials are currently in use.
Confirm those with the maintainers before making a hosted change.

The database integration workflow validates a local rebuild; it does not deploy migrations. The
repository does not establish the hosted migration or rollback procedure. Confirm the procedure and
backup requirements before applying a migration to a hosted database.

`GET /health` reports application status and version. It does not check Supabase or external services,
so a healthy response does not prove those dependencies are available. See
[Deployment](CONTRIBUTING.md#deployment) for the available build scripts and configuration notes.
