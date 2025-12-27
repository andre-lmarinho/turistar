# Realtime Collaboration

This document explains how the planner keeps multiple clients in sync while respecting optimistic updates and resolving conflicts.

## Overview

The planner combines five layers to deliver collaborative editing:

1. **Realtime connection** – `usePlanCollaboration` opens a Supabase Realtime channel per plan so that every inserted row in `plan_events` broadcasts to connected clients almost immediately.
2. **Event-sourced model** – Instead of mutating a single row, the client appends typed events (`activity.created`, `day.reordered`, etc.) that describe every user intent.
3. **Optimistic synchronization** – Drag and drop or form submissions update the UI first, then persist through the event pipeline; confirmed events reconcile with the optimistic state.
4. **Concurrency control** – Each plan tracks a monotonically increasing `version`. Writes include the caller’s `baseVersion`, so conflicting updates are rejected and retried with the fresh state.
5. **Persistence and recovery** – Durable snapshots live in `plan_snapshots`, and on load or resync clients replay missing events before resuming realtime updates.

Each section below expands on the responsibilities and provides implementation references.

## Realtime connection

- `subscribeToPlanEvents` registers a Supabase Realtime `postgres_changes` listener filtered by `plan_id`. Every incoming row is validated before being converted to a domain event.
- `usePlanCollaboration` owns the lifecycle of that channel. When mounted, it loads the latest snapshot, subscribes to the channel, and streams new events into local reducers. Disconnecting (unmounting) tears the channel down safely.
- The hook exposes the consolidated plan state, current version, and the `persistDays` helper so consuming components continue using a single interface while benefiting from realtime updates.

## Event payloads

Events are strongly typed in `PlanEvent.ts` and include:

| Type               | Payload summary                                | Notes                                                                       |
| ------------------ | ---------------------------------------------- | --------------------------------------------------------------------------- |
| `activity.created` | `{ dayId, activity, position }`                | Inserts the sanitized activity into the destination day using gap ordering. |
| `activity.updated` | `{ activityId, patch }`                        | Applies partial updates to a single activity.                               |
| `activity.deleted` | `{ activityId }`                               | Removes the activity regardless of its current day.                         |
| `activity.moved`   | `{ activityId, fromDayId, toDayId, position }` | Moves an activity between days and repositions it.                          |
| `day.created`      | `{ day }`                                      | Adds a new day snapshot (including its ordered activities).                 |
| `day.updated`      | `{ dayId, patch }`                             | Updates metadata (label, etc.) for a specific day.                          |
| `day.removed`      | `{ dayId }`                                    | Removes a day and its activities from the plan.                             |
| `day.reordered`    | `{ dayId, position }`                          | Updates a day’s gap‑order position.                                         |

The reducers interpret each event and update the in-memory `PlanState`. Tests guard the expected behaviour.

## Version handling and optimistic workflow

1. The initial snapshot fetched from `plan_snapshots` returns `{ version, days }`. Missing rows default to version `0` with empty days so new plans load predictably.
2. Every client tracks the current `version`. When a user performs an action, `diffPlanEvents.ts` compares the previous and next state, emitting the minimal set of events; the hook sends them alongside the current `version` as `baseVersion`.
3. `appendPlanEvents` calls the `append_plan_events` RPC, which validates the `baseVersion` server-side before writing rows. The RPC responds with the committed `version` and a canonical copy of the inserted events.
4. While the RPC is in-flight, the UI already reflects the optimistic state returned by the reducer. If Supabase confirms the write, the optimistic entry is reconciled against the canonical payload; otherwise the hook reloads the snapshot and latest events and reapplies them to heal divergence.

## Conflict resolution and ordering

- Conflicts occur when `baseVersion` is stale. The RPC rejects the mutation, causing `usePlanCollaboration` to refresh from the source of truth before retrying or surfacing an error.
- Activities and days use numeric string positions (for example `1024`, `1536`). Helpers compute midpoints so concurrent inserts rarely collide and renumbering stays minimal.
- Snapshots are normalized when mapped from Supabase rows, and `diffPlanEvents` fills in missing positions before emitting events.

## Persistence and recovery

- Snapshots persist in `plan_snapshots.state`. On load or resync, `usePlanCollaboration` fetches the newest snapshot and then calls `fetchPlanEvents(planId, snapshot.version)` to replay missed changes.
- If a version gap is detected, the hook reloads the latest snapshot and replays missing events. Channel lifecycle (subscribe/unsubscribe) is managed by `usePlanCollaboration`.
- Local storage can cache lightweight preferences, but the canonical data source remains Supabase Postgres.

## Implementation checklist

When extending the planner, be sure to:

- Add new event types to `PlanEvent.ts`, update reducers/tests, and document payload semantics here.
- Maintain schemas to validate Supabase rows when tables evolve.
- Update Supabase migration + RPC whenever the event schema changes so optimistic writes continue to be atomic.
- Keep the architecture section in [ARCHITECTURE](../ARCHITECTURE.md) aligned with this reference.

## Related decisions

See [decisions/0001-collaboration-model](decisions/0001-collaboration-model.md).
