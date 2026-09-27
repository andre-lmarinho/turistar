# Demo

The demo feature signs visitors into a shared account, explains how it works, and requests a periodic reset of the demo data.

## How it works

- The login and signup screens call `demoSignIn` with the shared demo credentials. Visitors use the same authenticated account and can see each other's changes.
- [`supabase/seed.sql`](../../../supabase/seed.sql) creates the demo profile, curated plans, expenses, and their saved baseline during a database reset.
- When the demo account opens its dashboard, the page calls `resetDemoIfStale`. The database function restores the baseline after an hour has elapsed since the last reset. There is no background scheduler.
- Resets run on entry and are best-effort. A reset failure does not block the dashboard, and an already-open session is not refreshed automatically.
- `DemoGuideDialog` displays the intro and explains that the account is shared.

## Main files

| File | Responsibility |
| --- | --- |
| [demo.ts](lib/demo.ts) | Demo account identity and detection. |
| [demoSignIn.ts](lib/demoSignIn.ts) | Shared-account sign-in through the auth handler. |
| [resetDemoIfStale.ts](lib/resetDemoIfStale.ts) | Server-side reset request on dashboard entry. |
| [DemoRepository.ts](repositories/DemoRepository.ts) | Calls the `maybe_reset_demo` database function. |
| [DemoGuideDialog.tsx](components/DemoGuideDialog.tsx) | Shared-account introduction. |

The login and signup entry points are in the [auth module](../../modules/README.md). The reset is triggered by the [user dashboard page](../../app/(webapp)/u/[slug]/page.tsx).

## Related docs

- [Architecture](../../../ARCHITECTURE.md)
- [Feature index](../README.md)
- [Database workflow](../../../CONTRIBUTING.md#database-workflow)
