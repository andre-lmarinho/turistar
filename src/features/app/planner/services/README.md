# Planner Services

Adapters that talk to external systems used by the planner slice.

## Responsibility

- Encapsulate IO with Supabase, realtime, and third-party APIs.
- Validate and map external data into domain-friendly shapes.
- Expose small, typed, testable interfaces.

## Guidelines

- No UI logic or React/Next imports.
- No domain decisions; keep business rules in domain.
- Use explicit column selection (avoid `select('*')`).
- Accept clients as parameters to improve testability.
- Normalize errors with context (operation + identifiers).

## Anti-patterns

- Mixing domain logic into services.
- Mutating global state or module-level caches.
- Calling services directly from UI without a hook or server orchestrator.
