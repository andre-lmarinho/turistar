# Snapshots

Reads and validates the latest saved itinerary so a plan can load without replaying its entire event history.

## How it works

- `plan_snapshots` holds one current row per plan. Its state contains days and activities; the row also records the version and update timestamp.
- `SnapshotsService` validates the row and normalizes ordering positions. A missing row becomes an empty document at version zero.
- `EventsService` computes the next state with the shared event reducer. `append_plan_events` saves the snapshot and event batch atomically.
- The plan service uses snapshots for initial data; the collaboration hook loads snapshots and subsequent events for recovery. See [events](../events/README.md) for retry and realtime behavior.

Expense entries and members use their own tables and queries; [Architecture](../../../ARCHITECTURE.md) describes those persistence paths.

## Main files

| File | Responsibility |
| --- | --- |
| [SnapshotsRepository.ts](repositories/SnapshotsRepository.ts) | Reads the current row from `plan_snapshots`. |
| [SnapshotsService.ts](services/SnapshotsService.ts) | Validation and empty-document fallback. |
| [snapshotSchemas.ts](repositories/snapshotSchemas.ts) | Stored shape, domain mapping and position normalization. |
| [types.ts](types.ts) | Snapshot returned to callers. |

## Related docs

- [Architecture](../../../ARCHITECTURE.md)
- [Plan](../plan/README.md)
- [Feature guide](../README.md)
