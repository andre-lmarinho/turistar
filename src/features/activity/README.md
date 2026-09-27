# Activity

Defines the itinerary's days and activities, creates local drafts and supplies activity colors.

## How it works

- A `DayPlan` uses an ISO date as its ID and contains a label and activities. Activity IDs stay stable when activities move between days.
- Day helpers build the initial empty itinerary from trip dates. Draft helpers create activities with default values before the editor saves them.
- Colors are shared by the planner views. Cards and editors are rendered in the [planner module](../../modules/README.md).
- Saved activity and day changes go through [events](../events/README.md), whose reducer applies the operations.

## Main files

| File | Responsibility |
| --- | --- |
| [types.ts](types.ts) | `Activity`, `DayPlan` and color types. |
| [dayOperations.ts](lib/dayOperations.ts) | Date labels and initial days. |
| [placeholders.ts](lib/placeholders.ts) | Activity IDs, draft defaults and placeholder detection. |
| [useActivityColors.ts](hooks/useActivityColors.ts) | Color values used by activity cards. |

## Related docs

- [Architecture](../../../ARCHITECTURE.md)
- [Feature guide](../README.md)
