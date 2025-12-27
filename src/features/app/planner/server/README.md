# Planner Server

Server-only orchestration for the planner slice.

## Responsibility

- Build planner-specific read models for pages and server actions.
- Orchestrate domain + services with explicit inputs and outputs.
- Apply access decisions passed from entry routes and validate invariants.

## Guidelines

- Keep modules server-only and free of client imports.
- Do permission checks in `page.tsx`; helpers can re-validate assumptions.
- Use explicit column selection and map rows into domain/view models.
- Prefer dependency injection of clients for testability.
- Surface descriptive errors with context (operation + identifiers).

## Anti-patterns

- Business rules that belong in domain.
- Cross-feature orchestration that belongs in `src/server`.
- UI formatting or React usage here.
- Hidden auth checks in layouts or components.
