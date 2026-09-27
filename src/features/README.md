# Features

Features group domain types, operations and data access. Start with [Architecture](../../ARCHITECTURE.md) for the system flow and [Modules](../modules/README.md) for the screens that use them.

## Feature guide

| Feature | Responsibility |
| --- | --- |
| [Activity](activity/README.md) | Day and activity types, draft creation and display colors. |
| [Auth](auth/README.md) | Sign-in, registration, password recovery and server viewer lookup. |
| [Budget](budget/README.md) | Expense entries and stored plan budgets. |
| [Demo](demo/lib/demoSignIn.ts) | Shared demo account, onboarding dialog and reset on dashboard entry. |
| [Events](events/README.md) | Activity/day edits, optimistic state, persistence and realtime recovery. |
| [Members](members/README.md) | Plan membership and administrative operations. |
| [Plan](plan/README.md) | Plan creation, access, initial data, dashboard queries and metadata. |
| [Profile](profile/README.md) | Profile provisioning, usernames and account details. |
| [Search](search/README.md) | Destination and activity search through Geoapify, with Wikidata images. |
| [Snapshots](snapshots/README.md) | Reading and validating the latest persisted itinerary state. |

## Working in a feature

Keep business rules in services and database access in repositories. Compose screens in `src/modules`; place route authorization in `page.tsx`. Follow existing patterns in the feature you are changing.

Activity and day edits use the event log and snapshots. Expense entries, members and profiles have their own persistence paths. See [Architecture](../../ARCHITECTURE.md) before adding a new write path.

The demo uses a shared authenticated account. [resetDemoIfStale](demo/lib/resetDemoIfStale.ts) attempts a reset when its dashboard is opened; the database decides whether a reset is due.

## Related docs

- [Contributing](../../CONTRIBUTING.md)
- [tRPC](../trpc/README.md)
