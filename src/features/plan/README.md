# Plan

Coordinates plan creation, access, initial planner data, dashboard queries and metadata changes on the server.

## How it works

- A page supplies the current viewer to `createPlanService`. `getPlannerExperience` resolves the plan by ID or slug and requires the viewer to be its owner or a member.
- Loading reads the latest itinerary snapshot and expense entries. If the snapshot has no days, the service builds initial days from the plan's date range.
- The [planner module](../../modules/README.md) receives that initial data. Later activity and day edits use [events](../events/README.md).
- Creation saves the owner, dates and destination metadata. A best-effort Geoapify/Wikidata lookup supplies the cover image.
- Dashboard queries use plan summaries; the cards show the latest 50 plans and the destination map uses the full result.
- Members can update plan metadata. Deleting a plan requires ownership.

## Main files

| File | Responsibility |
| --- | --- |
| [PlanService.ts](services/PlanService.ts) | Access checks and plan workflows. |
| [createPlanService.ts](services/createPlanService.ts) | Wires repositories, snapshot service and viewer. |
| [PlanRepository.ts](repositories/PlanRepository.ts) | Plan queries and database operations. |
| [helpers.ts](lib/helpers.ts) | Initial days from stored dates. |

## Related docs

- [Architecture](../../../ARCHITECTURE.md)
- [Snapshots](../snapshots/README.md)
- [Members](../members/README.md)
- [Feature guide](../README.md)
