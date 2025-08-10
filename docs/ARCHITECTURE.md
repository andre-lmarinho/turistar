# Project Architecture

This document outlines the structure of Turistar and highlights important design choices.

## Directory Overview

- `src/app` – Next.js **App Router** pages and API routes. It includes the root layout, planner screens and API endpoints used during development. See [Routing](ROUTING.md) for detailed structure.
- `src/features` – Feature modules with their own components, hooks and services.
- `src/shared` – Shared UI components, hooks, utilities and types used across features.
- `src/server` – Server actions and API handlers that interact with external services.
- `src/data` – Inspiration JSON files for sample itineraries.
- `public` – Static assets and preview images served directly by Next.js.

```ts
import { PlannerControls } from '@/features/planner';
```

For deeper feature details see [home](features/home.md), [planner](features/planner.md), [budget](features/budget.md) and [onboarding](features/onboarding.md).

## Key Design Decisions

- **Next.js App Router** – Provides file based routing and server actions. Planner routes live under `/planner` while API helpers reside in `src/server`.
- **Drag‑and‑drop with DnD Kit** – Activities move via sensors and sortable logic encapsulated in hooks within `src/features/planner`.
- **Geoapify Integration** – Catalog data is fetched from Geoapify through `src/server/api/catalog` using the `NEXT_PUBLIC_GEOAPIFY_KEY`.
- **State management** – Planner and budget data live in feature contexts and synchronize to Supabase through shared hooks.
- **Catalog ranking** – The `SUBCLASS_BOOST` record in `src/shared/lib/ranking.ts` assigns extra weight to specific subclasses. Weights range from 0 to 0.2:
  - `tourism.attraction` – 0.2
  - `tourism.sights` – 0.15
  - `entertainment.museum` – 0.1
  - `entertainment.culture.gallery` – 0.05
  - `natural.protected_area` – 0.05
  - Subclasses not listed default to 0
