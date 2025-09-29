# Planner Feature Guide

The planner feature orchestrates collaborative trip editing, drag-and-drop scheduling, and budget tracking for shared itineraries.

## Key references

- [Planner realtime collaboration](../../docs/planner/realtime-collaboration.md) – event payloads, Supabase channel lifecycle, and optimistic workflow details.
- `src/features/planner/hooks/usePlanCollaboration.ts` – React hook that exposes the live plan state, optimistic mutations, and persistence helpers.
- `src/features/planner/services/supabase/planEventsRepository.ts` – Supabase data access layer with Zod validation and realtime subscriptions.
- `src/features/planner/domain/events/planEventReducer.ts` – Pure reducers that apply events to the local `PlanState` while maintaining ordered days and activities.

## Workflow summary

1. Load the latest snapshot from `plan_snapshots`.
2. Subscribe to `plan_events` via Supabase Realtime and apply incoming events locally.
3. When the UI changes, compute minimal events with `diffPlanEvents.ts`, persist them optimistically, and reconcile the confirmed results.
4. On conflicts, refetch the snapshot and replay events to ensure every client converges to the same version.

Follow the reference document above when adding event types or adjusting persistence so tests and Supabase migrations stay aligned.

## Drag-and-drop behaviour

- The planner mounts a single `PointerSensor` with a `distance: 6` activation constraint and a keyboard sensor to keep activation instant across desktop and touch devices. Sensors are created post-hydration inside `usePlannerSensors` to avoid the TouchSensor long-press fallback that affected Vercel builds.
- Each activity exposes an explicit drag handle rendered by `DragHandle.tsx`. Only the handle receives the DnD listeners so tapping or scrolling the card body never triggers a drag.
- Handles disable text selection and touch gestures so the pointer activation happens on the first frame.

## Optimistic reordering

- `useOptimisticReorder` wraps TanStack Query to apply local reorders synchronously and push them to `/api/plans/[planId]/reorder`.
- The hook mutates the React Query cache and planner context immediately, rolls back on server errors, and shows a toast (`Mudança desfeita. Não foi possível salvar.`) via `PlannerToastViewport`.
- The API persists fractional positions. If neighbouring positions collide the handler rebalances the entire day using `rebuildRanks` so repeated drags never require full renumbering on the client.
