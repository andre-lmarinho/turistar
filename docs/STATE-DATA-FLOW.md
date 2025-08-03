# Planner State Data Flow

This document outlines how planner data moves through the application.

## Initial Days

- `buildInitialDays` in `src/utils/initialDays.ts` creates the `DayPlan[]` used when the planner loads.
- Each trip date becomes a day object with a unique `id`, a formatted label and an empty `activities` list.

## Hooks

- `usePlanner` orchestrates planner state. It gathers trip range data and initializes drag-and-drop via `useDnDPlanner`.
- `useDnDPlanner` combines drag handlers from `useDragState` with activity helpers from `useActivityState`.
- Planner data is persisted in Supabase via dedicated hooks:
  - `usePlanDays` for days and activities
  - `usePlanTitle` for plan metadata
  - `useBudgetSupabase` for budget entries

## Components

- **PlannerClient** – main client component for `/planner`. It calls `usePlanner` to manage board state while the catalog is loaded by `DestinationFilterPanel` after categories are chosen.
- **PlannerBoard** – presentation layer for the drag-and-drop board. Receives `days` and DnD callbacks as props.
- **BudgetPanel** – controls travel expenses through `useBudgetSupabase` and updates activities when budgets change.
- **PlannerControls** – groups mode switching and date range selection UI.

`days` and other planner state flow from `usePlanner` down to these components, keeping the UI consistent and persisted across visits.
