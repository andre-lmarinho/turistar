# ADR 0001: Collaboration Model

## Context

The planner supports multiple users editing the same plan concurrently. A simple last‑write‑wins model would cause data loss and inconsistent UI states.

## Options considered

- Last‑write‑wins updates.
- Client‑only state merging.
- Event‑driven model with snapshots.

## Decision

Use an event‑driven collaboration model with:

- Append‑only events.
- Deterministic reducers.
- Periodic snapshots.

## Consequences

- Increased implementation complexity.
- Strong guarantees around consistency.
- Easier debugging and recovery.
