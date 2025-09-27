# Planner Realtime Collaboration

This document explains how the travel planner keeps multiple clients in sync while respecting optimistic UI updates and conflict resolution.

## Overview

The planner combines five layers to deliver collaborative editing:

1. **Realtime connection** – `usePlanCollaboration` opens a Supabase Realtime channel per plan so every inserted row in `plan_events` broadcasts to connected clients almost immediately.
2. **Event-sourced model** – instead of mutating a single row, the client appends typed events (`activity.created`, `day.reordered`, etc.) that describe every user intent.
3. **Optimistic synchronization** – drag and drop or form submissions update the UI first, then persist through the event pipeline; confirmed events reconcile with the optimistic state.
4. **Concurrency control** – each plan tracks a monotonically increasing `version`. Writes include the caller’s `baseVersion`, so conflicting updates are rejected and retried with the fresh state.
5. **Persistence and recovery** – durable snapshots live in `plan_snapshots`, and reconnecting clients replay any missing events before resuming realtime updates.

Each section below expands on the responsibilities and provides implementation references.

## Realtime connection

- `PlanEventsRepository.subscribeToPlan` registers a Supabase Realtime `postgres_changes` listener filtered by `plan_id`. Every incoming row is validated with Zod before being converted to a domain event. (`src/features/planner/services/supabase/planEventsRepository.ts`)
- `usePlanCollaboration` owns the lifecycle of that channel. When mounted, it loads the latest snapshot, subscribes to the channel, and streams new events into local reducers. Disconnecting (unmounting) tears the channel down safely. (`src/features/planner/hooks/usePlanCollaboration.ts`)
- The hook exposes the consolidated plan state alongside helpers (`persistEvents`, `persistDays`) so consuming components continue using a single interface while benefiting from realtime updates.

## Event payloads

Events are strongly typed in [`PlanEvent.ts`](../../src/features/planner/domain/types/PlanEvent.ts). They fall into three families:

| Type | Payload summary | Notes |
| --- | --- | --- |
| `activity.created` | `{ dayId, activity, position }` | Inserts the sanitized activity into the destination day using gap ordering, placing it before the first card with a greater position.
| `activity.updated` | `{ activityId, patch }` | Applies partial updates to a single activity.
| `activity.deleted` | `{ activityId }` | Removes the activity regardless of its current day.
| `activity.moved` | `{ activityId, fromDayId, toDayId, position }` | Moves an activity between days and repositions it.
| `day.created` | `{ day }` | Adds a new day snapshot (including its ordered activities).
| `day.updated` | `{ dayId, patch }` | Updates metadata (label, etc.) for a specific day.
| `day.removed` | `{ dayId }` | Removes a day and its activities from the plan.
| `day.reordered` | `{ dayId, position }` | Updates a day’s gap-order position.
| `budget.updated` | `{ total, currency }` | Synchronizes overall budget changes.

The reducers in [`planEventReducer.ts`](../../src/features/planner/domain/events/planEventReducer.ts) interpret each event and update the in-memory `PlanState`. Tests in `tests/unit/features/planner/hooks/usePlanCollaboration.test.ts` guard the behaviour.

## Version handling and optimistic workflow

1. The initial snapshot fetched from `plan_snapshots` returns `{ version, days }`. Missing rows default to version `0` with empty days so new plans load predictably.
2. Every client tracks the current `version`. When a user performs an action, `diffPlanEvents.ts` compares the previous and next state, emitting the minimal set of events along with the observed `baseVersion`.
3. `PlanEventsRepository.appendEvents` calls the `append_plan_events` RPC, which validates the `baseVersion` server-side before writing rows. The RPC responds with the committed `version` and a canonical copy of the inserted events.
4. While the RPC is in-flight, the UI already reflects the optimistic state returned by the reducer. If Supabase confirms the write, the optimistic entry is reconciled against the canonical payload; otherwise the hook reloads the snapshot + latest events and reapplies them to heal divergence.

## Conflict resolution and ordering

- Conflicts occur when `baseVersion` is stale. The RPC rejects the mutation, causing `usePlanCollaboration` to refresh from the source of truth before retrying or surfacing an error.
- Activities and days use **gap ordering** strings (e.g., `a0`, `a0m`, `a1`). Helpers in [`gapOrdering.ts`](../../src/features/planner/domain/events/gapOrdering.ts) calculate safe insertion points so concurrent inserts rarely collide and renumbering stays minimal.
- Reducers always normalize incoming snapshots/events through `normalizePositions`, ensuring arrays remain sorted even if out-of-order payloads arrive.

## Persistence and recovery

- Snapshots persist in `plan_snapshots.state`. When a client reconnects, `usePlanCollaboration` fetches the newest snapshot and then calls `fetchEvents(planId, snapshot.version)` to replay missed changes.
- If the realtime channel disconnects, the hook automatically resubscribes using the latest known version, so the UI catches up seamlessly without a full page reload.
- Local storage can cache lightweight preferences, but the canonical data source remains Supabase Postgres. Any future offline mode should serialize a snapshot + unpersisted events and sync them through the same RPC once connectivity returns.

## Implementation checklist

When extending the planner, make sure to:

- Add new event types to `PlanEvent.ts`, update reducers/tests, and document payload semantics here.
- Maintain Zod schemas in `planEventsRepository` to validate Supabase rows when tables evolve.
- Update the Supabase migration + RPC whenever the event schema changes so optimistic writes continue to be atomic.
- Keep the architecture section in `docs/ARCHITECTURE.md` aligned with this reference.
