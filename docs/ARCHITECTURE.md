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

## Vertical Slice Decisions

- **Feature-owned orchestration**: Routes delegate to feature entry points (e.g., `/inspiration/[city]` re-exports the page from `features/inspiration`). Each slice exposes a single composition component so the `app/` layer stays thin.
- **Collocated infrastructure**: Inspiration JSON fixtures now reside in `features/inspiration/data`, and the slice owns the loaders that parse them. Future migrations should continue moving persistence, server actions, and DTO mapping into their respective features.
- **Shared layer is minimal**: `src/shared` remains reserved for UI atoms, pure utilities, and framework adapters. Domain-specific helpers (like inspiration metadata builders) live with the slice that consumes them to avoid cross-feature coupling.

## UI Folder Conventions

- Use `ui/screens` only when a feature needs full-page orchestrators (e.g., planner experiences). If a slice exposes a single composition, you can keep it in the slice `index.ts` instead of a nested folder.
- Group overlays such as onboarding or activity editors under `ui/modals`.
- Place reusable pieces like cards, accordions, or icons in `ui/widgets` (feature-specific) or `src/shared/ui` (cross-feature atoms). Keep these components lightweight and decoupled from domain logic so they can be shared safely.
