---
title: Early Returns
impact: MEDIUM
impactDescription: Makes validation and the main execution path easier to follow
tags: patterns, readability, early-return
---

# Use early returns

Handle invalid input, missing records, and empty work before the main operation. Throw a contextual error for a failure; return early when there is no work to do.

For example, `EventsService.appendEvents` validates the version and then handles an empty event batch:

```typescript
if (events.length === 0) {
  return { version: baseVersion, events: [] };
}
```

The remaining code can fetch the snapshot and append events without another nested branch. See [EventsService](../../src/features/events/services/EventsService.ts) for the full flow.
