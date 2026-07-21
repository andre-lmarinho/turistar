# Planner Feature

The planner feature orchestrates collaborative trip editing, drag-and-drop scheduling, and budget tracking for shared itineraries.

## Workflow summary

1. Load the latest snapshot from `plan_snapshots`.
2. Subscribe to `plan_events` via Supabase Realtime and apply incoming events locally.
3. When the UI changes, compute minimal events with `diffPlanEvents.ts`, persist them optimistically, and reconcile the confirmed results.
4. On version gaps, refetch the snapshot and replay events so clients converge on the same version.

## Data Flow
```text
Plan Feature
  └─> Activity Feature (organizes activities by day)
        └─> Events Feature (generates events for all changes)
              └─> Snapshots Feature (updates snapshots when events are appended)

Collaborative Editing
  └─> Members Feature (user permissions and access control)
        └─> Budget Feature (plan-level budget tracking)

Plan Data
  └─> Search Feature (destination search for plan creation)
```