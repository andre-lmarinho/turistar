# Events Feature

Handles plan event sourcing, real-time collaboration events, and client sync.
Snapshot persistence lives in `src/features/snapshots`.

## Key Concepts

### Event Sourcing

All changes to plan state are represented as immutable events. Instead of storing the current state, we store the complete event history and replay events to reconstruct state.

**Event Types:**
- `activity.created` - New activity added to a day
- `activity.updated` - Activity fields changed
- `activity.deleted` - Activity removed
- `activity.moved` - Activity moved between days
- `day.created` - New day added to plan
- `day.updated` - Day properties changed
- `day.removed` - Day removed from plan
- `day.reordered` - Day position changed

### Snapshots

Snapshots are periodic captures of the plan state (DayPlan[]) at a specific version. This allows fast recovery without replaying all events from version 0.

### Real-time Sync

When multiple users view the same plan:

1. Each client fetches the latest snapshot
2. Clients subscribe to realtime events via Supabase
3. When events arrive, the reducer applies them to local state
4. Local changes are sent as events via `appendEvents()`
5. All clients receive the same events and converge on the same state

### Conflict Resolution

The `gapOrdering` algorithm provides conflict-free ordering of activities within days. When two users move activities simultaneously:

1. Each generates a unique `position` string based on gap ordering
2. The position is deterministic and non-conflicting
3. Events can be applied in any order and reach the same final state
