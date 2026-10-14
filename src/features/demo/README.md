# Demo

The demo feature signs visitors into a shared account, explains how it works, and requests a periodic reset of the demo data.

## How it works

- The login and signup screens call `demoSignIn` with the shared demo credentials. Visitors use the same authenticated account and can see each other's changes.
- [`supabase/seed.sql`](../../../supabase/seed.sql) creates the demo profile, curated plans, expenses, and their saved baseline during a database reset.
- When the demo account opens its dashboard, the page calls `resetDemoIfStale`. After an hour, the database restores the examples, including deleted plans, their URLs, itinerary, expenses, and owner membership. Calls from other accounts cannot trigger the reset. There is no background scheduler.
- Rome started yesterday and Boipeba starts in 30 days. Seed and reset shift the dates and day labels together using `America/Bahia`, while preserving activity IDs and content.
- Baselines and reset bookkeeping are not accessible to visitors. Concurrent resets are serialized; user-created demo plans and itinerary edits are removed, without changing other accounts' trips.
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

## Verify the examples

Enter the demo and open Rome and Boipeba: Rome includes today, and Boipeba is upcoming.
Edit or delete an example. On the next dashboard entry after the reset interval, its
original content and URL return. Already-open sessions still need a refresh.
Integration tests run against local Supabase with
`pnpm test:integration src/features/demo/repositories/DemoRepository.integration-test.ts`.
They restore the curated examples after each test; use a disposable local stack.

## Related docs

- [Architecture](../../../ARCHITECTURE.md)
- [Feature index](../README.md)
- [Database workflow](../../../CONTRIBUTING.md#database-workflow)
