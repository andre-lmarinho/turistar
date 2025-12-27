# Planner Domain

Pure business logic for the planner slice.

## Responsibility

- Define domain types, events, and invariants.
- Provide deterministic reducers and transformations.
- Handle validation and normalization without side effects.

## Guidelines

- Functions are pure and deterministic; no IO or global state.
- Accept time/randomness as parameters when needed.
- Avoid framework dependencies; use TypeScript only.
- Keep APIs small and well-tested.
- Use `import type` for type-only imports.

## Anti-patterns

- Supabase/API calls or realtime subscriptions.
- React hooks or components.
- Reading env vars, localStorage, or global singletons.
- Mutating input arguments in place.
