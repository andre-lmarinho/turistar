# Project Architecture

This document outlines the structure of Turistar and highlights important design choices.

## Directory Overview

- `src/app`: Next.js App Router pages and API routes. It includes the root layout, planner screens, and API endpoints used during development.
- `src/features`: Feature modules with their own components, hooks, and services.
- `src/shared`: Shared UI components, hooks, utilities, and types used across features.
- `src/server`: Server actions and API handlers that interact with external services.
- `public`: Static assets and preview images served directly by Next.js.

For deeper feature details see the source files within `src/features`.

## Key Design Decisions

- Next.js App Router: file-based routing and server actions. Planner routes live under `/planner`, while API helpers reside in `src/server`.
- Drag-and-drop with DnD Kit: activities move via sensors and sortable logic encapsulated in hooks within `src/features/planner`.
- State management: planner data, including budget, lives in feature contexts and synchronizes to Supabase through shared hooks.
- Geoapify search: destination search and autocomplete run through `/api/search` and client hooks.

## Planner realtime collaboration

The planner uses a realtime, event-driven workflow so multiple travelers can edit the same plan simultaneously:

- **Realtime connection** – `usePlanCollaboration` opens a Supabase Realtime channel that streams every new row from `plan_events` to the client. Incoming payloads are validated in `planEventsRepository` before the reducers consume them.
- **Event reducers** – Each change is represented as a typed event handled by `planEventReducer.ts`, which applies optimistic updates locally while maintaining ordered days/activities via gap ordering utilities.
- **Optimistic persistence** – `diffPlanEvents.ts` compares the previous and next state when a user interacts with the planner, emits the minimal set of events, and persists them through the `append_plan_events` RPC. Conflicts trigger a snapshot refresh to reconcile versions.
- **Durable snapshots** – On load, the hook fetches the latest `plan_snapshots` entry, replays missing events, and then keeps the realtime channel alive. Reconnecting clients follow the same pattern to recover.

See [Planner Realtime Collaboration](./planner/realtime-collaboration.md) for a full reference covering payloads, versioning, and failure handling.

## Vertical Slice Decisions

- **Feature-owned orchestration**: Routes delegate to feature entry points (e.g., `/inspiration/[city]` re-exports the page from `features/inspiration`). Each slice exposes a single composition component so the `app/` layer stays thin.
- **Collocated infrastructure**: Inspiration JSON fixtures now reside in `features/inspiration/data`, and the slice owns the loaders that parse them. Future migrations should continue moving persistence, server actions, and DTO mapping into their respective features.
- **Shared layer is minimal**: `src/shared` remains reserved for UI atoms, pure utilities, and framework adapters. Domain-specific helpers (like inspiration metadata builders) live with the slice that consumes them to avoid cross-feature coupling.

## UI Folder Conventions

- Place feature orchestrators and domain-specific compositions inside `components/`, grouping by capability (e.g., `components/dnd`, `components/budget`, `components/map`). Routes should import from these modules instead of assembling UI inside `app/`.
- Keep overlays, editors, and other layered experiences alongside the rest of the feature components (for example, `components/dialog/ActivityDialog.tsx`), so the slice owns its full UX.
- Reserve `ui/` for micro widgets like buttons or popups. Create focused subfolders such as `ui/buttons` and `ui/popups`, and keep shared atoms in `src/shared/ui` when they are reused across slices.
