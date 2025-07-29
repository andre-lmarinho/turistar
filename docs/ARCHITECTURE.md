# Project Architecture

This document outlines the structure of Turistar and highlights important design choices.

## Directory Overview

- `src/app` – Next.js **App Router** pages and API routes. It includes the root layout, the planner screens and the `/api/catalog` endpoint used during development.
- `src/components` – Reusable React components grouped by feature such as the planner board, budget views, onboarding flows and UI primitives.
- `src/hooks` – Custom React hooks for catalog queries, drag‑and‑drop helpers and shared UI logic.
- `src/constants` – Shared configuration values like color palettes, budget categories and onboarding copy.
- `src/data` – Inspiration JSON files for sample itineraries loaded via the dynamic loader.
- `src/lib` – Generic utilities including the `useLocalStorageSync` hook for persistence.
- `src/types` – TypeScript definitions for planner data and budget items.
- `src/utils` – Planner‑specific helpers for manipulating day plans and activities.
- `public` – Static assets and preview images served directly by Next.js.

## Key Design Decisions

- **Next.js App Router** – Leveraged for file based routing and built‑in API endpoints. The planner resides under `/planner` while the catalog is served from `src/app/api/catalog`.
- **Drag‑and‑drop with DnD Kit** – Activities are moved by sensors and sortable logic encapsulated in hooks within `src/hooks/planner`.
- **Geoapify Integration** – The catalog is fetched from Geoapify through `/api/catalog` using the `GEOAPIFY_KEY`.
- **State management** – Planner and budget data live in React state and synchronize to `localStorage` through `useLocalStorageSync`. Catalog queries are fetched using React Query.
- **Dynamic inspiration** – Sample trips in `src/data` are loaded at runtime using [`src/utils/inspirationLoader.ts`](../src/utils/inspirationLoader.ts).
