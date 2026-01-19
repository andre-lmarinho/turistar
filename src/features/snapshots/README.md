# Snapshots Feature

Handles persisted plan snapshots for fast state hydration in event sourcing system.

## Overview

This feature provides:
- Automatic snapshot creation and updates via events system
- Fast plan state recovery without replaying all events
- Schema validation and type safety for snapshot data

## Key Concepts

### Event Sourcing Integration
- Snapshots are automatically created when events are appended
- Each event updates the snapshot state and version atomically
- Latest snapshot stored per plan (no version history)

### State Loading
1. Load latest snapshot for fast initial state
2. Apply events since snapshot version
3. Subscribe to real-time events for live updates

## Data Flow
```text
Snapshots Feature
  └─> Events Feature (creates/updates snapshots when events are appended)
        └─> Plan Feature (loads snapshots for fast state initialization)

State Loading
  └─> All plan-related features (Activity, Budget, Members)
        └─> Fast state hydration without replaying all events
```

## Dependencies

- `@/features/events/`
- `@/features/activity/`