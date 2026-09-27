# Budget

Stores categorized expense entries and the plan's budget value. The planner's budget view shows recorded expenses and totals by category.

## How it works

- `BudgetView` reads and changes entries through `viewer.budget` tRPC procedures, backed by `BudgetService` and `BudgetRepository`.
- Entry updates and deletions update the query cache immediately and roll back on failure. Creation waits for the server-generated ID. Each mutation invalidates the query afterward.
- Activity budgets are summed from the current itinerary into the activities category. Manual entries are stored separately in `budget_entries`.
- The service also reads and updates `plans.budget`.
- Database policies restrict budget data to plan owners and members.

## Main files

| File | Responsibility |
| --- | --- |
| [BudgetService.ts](services/BudgetService.ts) | Budget and expense operations. |
| [BudgetRepository.ts](repositories/BudgetRepository.ts) | Reads and writes to `plans` and `budget_entries`. |
| [types.ts](types.ts) | Entry shape, category keys and display configuration. |
| [BudgetView.tsx](../../modules/planner/views/BudgetView.tsx) | Query state, expense editing and derived totals. |

## Related docs

- [Architecture](../../../ARCHITECTURE.md)
- [Activity](../activity/README.md)
- [Feature guide](../README.md)
