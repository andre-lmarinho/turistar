# Planner events and sync

This feature saves planner changes as events and keeps local edits in sync with the server. The UI applies edits immediately. The same reducer handles local edits, drag previews and saved events, including snapshot updates and history replay.

## Main files

| File | Responsibility |
| --- | --- |
| [`usePlannerDocument`](../../modules/planner/hooks/usePlannerDocument.ts) | Provides activity and date actions to the UI. |
| [`planOperations`](lib/planOperations.ts) | Builds events for moves and date changes. A move identifies the destination day and the activity it should precede. |
| [`usePlanCollaboration`](hooks/usePlanCollaboration.ts) | Keeps confirmed state and pending edits, sends requests and handles server updates. |
| [`eventReducer`](lib/eventReducer.ts) | Applies each change to the document. |

A `PlanOperation` has a `type` and `payload`. The hook assigns an ID when it queues the operation. The server assigns its version and timestamp.

## How edits reach the server

```text
UI action -> dispatch -> pending queue -> immediate render
                              |
                        one append at a time
                              |
HTTP response / realtime -> confirmed state -> reapply pending edits
```

The UI displays `pending.reduce(applyEvent, confirmed.days)`. `dispatch` reads this state, so consecutive edits see each other even before React renders again. Local edits leave the confirmed version unchanged.

One append runs at a time per hook session. Users can keep editing while it waits. When the server confirms events, the hook removes their IDs from the queue and reapplies the remaining edits. HTTP responses and realtime events follow the same version order. Older fetch responses cannot replace newer confirmed state.

Edits made during the initial load use the days supplied by the page. After loading, the hook applies those edits to the server state. If the server document is empty at version zero, the first edit also sends `day.created` events for all initial days, preserving their labels and any empty days. Opening the planner alone does not save them.

Each plan has its own session. Switching plans resets selection and form state; outstanding responses from the previous session are ignored.

## Conflicts and retry

`append_plan_events` locks the snapshot and checks `base_version`. A version mismatch returns the current version and **an empty event list**. The client fetches the missing events and retries against the updated version, with a limit on consecutive conflict retries.

The database does not enforce unique event IDs. A write can succeed even if its response is lost. Before retrying a failed request, the client fetches history from its previous confirmed version and removes pending IDs already saved. Starting from a fresh snapshot's version could skip those IDs and duplicate a write.

Failed edits stay visible. The error banner offers Retry and asks for confirmation before discarding unsynced changes. Discard clears pending edits and refreshes the document; changes already saved remain. Validation and permission errors require the user to resolve the cause or discard the edits.

## Realtime recovery

On `SUBSCRIBED`, including reconnects, the hook fetches missed events. If a fetch is already running, it fetches again afterward to cover changes made before the subscription was ready.

Events that arrive out of order wait in a buffer. Missing versions trigger a fetch. If that fetch leaves a buffered gap, the error clears when the missing versions arrive and the queue resumes automatically. Other errors, including failed appends whose outcome is unknown, still require Retry.

## Editing behavior

- **Activity dialog:** saves only changed fields, so changing a title preserves another collaborator's notes. An untitled activity stays in a local draft until it has a title.
- **Coordinates:** `null` in a patch removes a coordinate. An `undefined` value would be lost during JSON serialization.
- **Drag and drop:** stores the active ID and destination. The reducer builds the preview from current data. Drop sends one move; cancel clears the preview.
- **Dates:** shifting a range without changing its length keeps activities on the same trip-day. Resizing keeps overlapping dates and moves activities from removed days to the first or last remaining day.

Events apply in server version order. Changes to different fields combine; for the same field, the later event wins. Moves find the activity by ID even if its original day has changed. Updating or deleting an absent activity, or moving to an absent day, has no effect. Creating an activity in a missing day still creates that day to support older event history.

Numeric midpoint positions determine order. Positions can be equal, and replay must follow server versions. The ordering scheme is not a CRDT.

## Limits

Pending edits live in memory. Reloading, closing the page or leaving the plan can lose unsynced changes. Offline support would need persistent local storage and rules for resolving offline conflicts.

## Tests

Run the affected suites and type check with:

```sh
pnpm exec vitest run src/features/events src/features/activity/lib/dayOperations.test.ts src/modules/planner
pnpm typecheck:ci
```

Use `pnpm exec vitest run <paths>` to select suites; `pnpm test -- <paths>` can run the entire suite with the current script setup.

Tests cover edits during pending requests, retry after a lost response, version gaps and reconnects. They also check date changes, drag previews and form drafts. Network timing is controlled in tests; production latency still needs a browser check against a deployed preview.
