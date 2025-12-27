# Planner Feature Guide

The planner feature orchestrates collaborative trip editing, drag-and-drop scheduling, and budget tracking for shared itineraries.

## Planner docs

- [Planner realtime collaboration](../../../../docs/realtime-collaboration.md) – event payloads, Supabase channel lifecycle, and optimistic workflow details.
- [Planner sharing and permissions](../../../../docs/sharing-and-permissions.md) – membership tiers, share links, and permission checks.

## Code references

- `src/features/app/planner/hooks/data/usePlanCollaboration.ts` – React hook that exposes the live plan state, optimistic mutations, and persistence helpers.
- `src/features/app/planner/services/supabase/planEventsQueries.ts` – Supabase data access for snapshots/events and the `append_plan_events` RPC.
- `src/features/app/planner/services/supabase/planEventsRealtime.ts` – Realtime subscriptions for `plan_events`.
- `src/features/app/planner/services/supabase/planEventsSchemas.ts` – Zod schemas and mappers for snapshots and events.
- `src/features/app/planner/domain/events/planEventReducer.ts` – Pure reducers that apply events to the local `PlanState` while maintaining ordered days and activities.

## Workflow summary

1. Load the latest snapshot from `plan_snapshots`.
2. Subscribe to `plan_events` via Supabase Realtime and apply incoming events locally.
3. When the UI changes, compute minimal events with `diffPlanEvents.ts`, persist them optimistically, and reconcile the confirmed results.
4. On version gaps, refetch the snapshot and replay events so clients converge on the same version.

Follow the reference document above when adding event types or adjusting persistence so tests and Supabase migrations stay aligned.
