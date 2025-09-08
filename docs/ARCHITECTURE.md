# Project Architecture

This document outlines the structure of Turistar and highlights important design choices.

## Directory Overview

- `src/app`: Next.js App Router pages and API routes. It includes the root layout, planner screens, and API endpoints used during development.
- `src/features`: Feature modules with their own components, hooks, and services.
- `src/shared`: Shared UI components, hooks, utilities, and types used across features.
- `src/server`: Server actions and API handlers that interact with external services.
- `src/data`: Inspiration JSON files for sample itineraries.
- `public`: Static assets and preview images served directly by Next.js.

```ts
import { PlannerControls } from '@/features/planner';
```

For deeper feature details see the source files within `src/features`.

## Key Design Decisions

- Next.js App Router: file-based routing and server actions. Planner routes live under `/planner`, while API helpers reside in `src/server`.
- Drag-and-drop with DnD Kit: activities move via sensors and sortable logic encapsulated in hooks within `src/features/planner`.
- State management: planner data, including budget, lives in feature contexts and synchronizes to Supabase through shared hooks.
- Geoapify search: destination search and autocomplete run through `/api/search` and client hooks.
