# Planner State Data Flow

This document outlines how planner data moves through the application.

## Initial Days

- `buildInitialDays` in `src/utils/initialDays.ts` creates the `DayPlan[]` used when the planner loads.
- Each trip date becomes a day object with a unique `id`, a formatted label and an empty `activities` list.

## Hooks

- `usePlanner` orchestrates planner state. It gathers trip range data, loads the catalog and initializes drag-and-drop via `useDnDPlanner`.
- `useDnDPlanner` combines drag handlers from `useDragState` with activity helpers from `useActivityState`.
- `useLocalStorageSync` persists planner data in `localStorage`. It is called by `usePlanner`, `usePlanTitle` and `useBudget`.

## Components

- **PlannerClient** – main client component for `/planner`. It calls `usePlanner` and passes state to the board, budget panel and modals.
- **PlannerBoard** – presentation layer for the drag-and-drop board. Receives `days` and DnD callbacks as props.
- **BudgetPanel** – controls travel expenses through `useBudget` and updates activities when budgets change.
- **PlannerControls** – groups mode switching and date range selection UI.

`days` and other planner state flow from `usePlanner` down to these components, keeping the UI consistent and persisted across visits.
