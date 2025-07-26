# Hooks Reference

This document outlines the available custom hooks in the project. Each section details the signature, expected inputs and outputs, lifecycle behaviors, thrown exceptions, and example usage.

## 1. Budget Hooks

### `useBudget`

_File: `src/hooks/budget/useBudget.ts`_

```ts
export function useBudget(planId: string, activitiesTotal: number);
```

- **Inputs**
  - `planId`: identifier for storage key.
  - `activitiesTotal`: initial value for the "Tours & Activities" category.
- **Outputs**
  Returns budget state (total, entries, category totals, etc.) and handlers for adding, updating, or deleting entries.
- **Lifecycle**
  - Syncs with `localStorage` via `useLocalStorageSync`.
  - Calculates totals with `useMemo`.
- **Exceptions**
  None.
- **Example**

```tsx
const { budget, setBudget, entries, handleAdd } = useBudget(planId, activitiesTotal);
```

## 2. General Hooks

### `useTripRange`

_File: `src/hooks/general/useTripRange.ts`_

```ts
export function useTripRange(dest: string, planId?: string);
```

- **Inputs**
  - `dest`: destination string.
  - `planId` (optional): used when updating the URL.
- **Outputs**
  Returns `tripDays`, `currentRange`, and `handleRangeChange`.
- **Lifecycle**
  Reads `start` and `end` parameters from the URL and updates them on range change.
- **Exceptions**
  None.
- **Example**

```ts
const { tripDays, handleRangeChange } = useTripRange(dest, planId);
```

## 3. Catalog Hooks

### `useCatalog`

_File: `src/hooks/catalog/useCatalog.ts`_

```ts
export function useCatalog(dest: string | null, options: { enabled: boolean });
```

- **Inputs**
  - `dest`: destination.
  - `options.enabled`: whether the query should execute.
- **Outputs**
  React Query result props plus `days` (activities grouped by day).
- **Lifecycle**
  - Fetches `/api/catalog?dest=…` when enabled.
  - Memoizes transformation of activities into `DayPlan[]`.
- **Exceptions**
  Throws an `Error` if the HTTP response is not OK.
- **Example**

```ts
const { days, isLoading } = useCatalog(dest, { enabled: true });
```

### `useDestinationCatalog`

_File: `src/hooks/catalog/useDestinationCatalog.ts`_

```ts
export function useDestinationCatalog(isOpen: boolean, city = 'salvador');
```

- **Inputs**
  - `isOpen`: whether the panel is visible.
  - `city`: destination name.
- **Outputs**
  Filtered `visibleItems`, category utilities, sort mode setters, loading and error flags.
- **Lifecycle**
  Fetches activities when the catalog panel opens and memoizes the filtered list.
- **Exceptions**
  Sets an error state when the fetch fails.
- **Example**

```ts
const { visibleItems, toggleCat } = useDestinationCatalog(open);
```

### `useDestinationFilter`

_File: `src/hooks/catalog/useDestinationFilter.ts`_

```ts
export function useDestinationFilter(isOpen: boolean);
```

- **Inputs**
  - `isOpen`: forwarded to `useDestinationCatalog`.
- **Outputs**
  Catalog filtering utilities plus the `city` name.
- **Lifecycle**
  Delegates to `useDestinationCatalog`; no additional side effects.
- **Exceptions**
  None.
- **Example**

```ts
const { city, visibleItems } = useDestinationFilter(panelOpen);
```

## 4. Planner Hooks

### `useActivitiesById`

_File: `src/hooks/planner/useActivitiesById.ts`_

```ts
export function useActivitiesById(days: DayPlan[]);
```

- **Inputs**
  - `days`: array of `DayPlan`.
- **Outputs**
  Memoized mapping `{ [activityId]: Activity & { dayId } }`.
- **Lifecycle**
  Recomputes when `days` changes.
- **Exceptions**
  None.

### `useActivityState`

_File: `src/hooks/planner/useActivityState.ts`_

```ts
export function useActivityState(setDays: React.Dispatch<React.SetStateAction<DayPlan[]>>);
```

- **Inputs**
  - `setDays`: state setter from `useState`.
- **Outputs**
  Functions `addActivity`, `removeActivity`, `updateActivity`, and `addBlankActivity`.
- **Lifecycle**
  Directly updates day plans via `setDays`.
- **Exceptions**
  None.

### `useDragState`

_File: `src/hooks/planner/useDragState.ts`_

```ts
export function useDragState(initialDays: DayPlan[]);
```

- **Inputs**
  - `initialDays`: starting planner state.
- **Outputs**
  DnD sensors and handlers (`handleDragStart`, `handleDragOver`, `handleDragEnd`) plus state (`days`, `activeId`).
- **Lifecycle**
  Maintains updated days during drag operations and throttles drag-over events via a time check.
- **Exceptions**
  None.

### `useDnDPlanner`

_File: `src/hooks/planner/useDnDPlanner.ts`_

```ts
export function useDnDPlanner(initialDays: DayPlan[]);
```

- **Inputs**
  - `initialDays`: initial board layout.
- **Outputs**
  Combines results from `useDragState` and `useActivityState`.
- **Lifecycle**
  No side effects beyond those of the composed hooks.
- **Exceptions**
  None.

### `usePlanParams`

_File: `src/hooks/planner/usePlanParams.ts`_

```ts
export function usePlanParams();
```

- **Outputs**
  `{ dest, planId }` from the URL.
- **Lifecycle**
  Generates a plan id when missing and updates the URL.
- **Exceptions**
  None.

### `usePlanDaysStorage`

_File: `src/hooks/planner/usePlanDaysStorage.ts`_

```ts
export function usePlanDaysStorage(
  planId: string,
  days: DayPlan[],
  setDays: React.Dispatch<React.SetStateAction<DayPlan[]>>
);
```

- **Outputs**
  None (side effects only).
- **Lifecycle**
  Loads days from `localStorage` and saves on change.
- **Exceptions**
  None.

### `usePlanner`

_File: `src/hooks/planner/usePlanner.ts`_

```ts
export function usePlanner(enabled: boolean);
```

- **Inputs**
  - `enabled`: whether catalog fetch is active.
- **Outputs**
  Planner state: days, trip range utilities, drag-and-drop handlers, and more.
- **Lifecycle**
  - Composes `usePlanParams`, `usePlanDaysStorage`, `useTripRange`,
    `useDnDPlanner`, and `useCatalog`.
  - Updates planner days whenever the trip range changes.
- **Exceptions**
  None internally; any catalog fetch errors are exposed via `error`.

### `usePlanTitle`

_File: `src/hooks/planner/usePlanTitle.ts`_

```ts
export function usePlanTitle(planId: string, defaultTitle = '');
```

- **Inputs**
  - `planId`: key for storage.
  - `defaultTitle`: initial title.
- **Outputs**
  `{ title, setTitle }`.
- **Lifecycle**
  Syncs the title to `localStorage`.
- **Exceptions**
  None.

### `useSelectedActivity`

_File: `src/hooks/planner/useSelectedActivity.ts`_

```ts
export function useSelectedActivity(
  days: DayPlan[],
  setDays: React.Dispatch<React.SetStateAction<DayPlan[]>>,
  { addActivity, removeActivity, updateActivity, addBlankActivity }: UseSelectedActivityOptions
);
```

- **Inputs**
  - `days`, `setDays`: planner state.
  - Activity helpers from `useActivityState`.
- **Outputs**
  Selected activity state along with actions for editing, saving, deleting, and changing day, position, or color.
- **Lifecycle**
  Coordinates modal editing and cleans up blank activities when canceled.
- **Exceptions**
  None (invalid save operations are ignored).

## 5. UI Hooks

### `useCardPopups`

_File: `src/hooks/ui/useCardPopups.ts`_

```ts
export function useCardPopups();
```

- **Inputs**
  None.
- **Outputs**
  Popup refs, boolean flags, and click handlers.
- **Lifecycle**
  Plain `useState` with no side effects.
- **Exceptions**
  None.

### `useEscapeKey`

_File: `src/hooks/ui/useEscapeKey.ts`_

```ts
export function useEscapeKey({
  onClose,
  isActive = true,
  triggerRef,
}: {
  onClose: () => void;
  isActive?: boolean;
  triggerRef?: RefObject<HTMLElement>;
});
```

- **Inputs**
  - `onClose`: callback when Escape is pressed.
  - `isActive`: enable or disable the listener.
  - `triggerRef`: element to restore focus to.
- **Outputs**
  None (effect only).
- **Lifecycle**
  Registers a `keydown` listener when active and restores focus on cleanup.
- **Exceptions**
  None.

### `useKeyBinds`

_File: `src/hooks/ui/useKeyBinds.ts`_

```ts
export function useKeyBinds({
  onPlanner,
  onMap,
  onBudget,
  onNewCard,
  onCatalog,
  isActive = true,
}: {
  onPlanner: () => void;
  onMap: () => void;
  onBudget: () => void;
  onNewCard: () => void;
  onCatalog: () => void;
  isActive?: boolean;
});
```

- **Inputs**
  - `onPlanner`: callback for Planner mode.
  - `onMap`: callback for Map mode.
  - `onBudget`: callback for Budget mode.
  - `onNewCard`: callback to create a new card.
  - `onCatalog`: callback to open the catalog.
  - `isActive`: enable or disable the listeners.
- **Outputs**
  None (side effect hook).
- **Lifecycle**
  Adds a `keydown` listener when active and removes it on cleanup.
- **Exceptions**
  None.

### `useFlexibleRef`

_File: `src/hooks/ui/useFlexibleRef.ts`_

```ts
export function useFlexibleRef();
```

- **Inputs**
  None.
- **Outputs**
  A ref object usable for both `HTMLButtonElement` and a generic `HTMLElement`.
- **Lifecycle**
  None beyond `useRef` initialization.
- **Exceptions**
  None.

### `usePopupOutsideHandler`

_File: `src/hooks/ui/usePopupOutsideHandler.ts`_

```ts
export function usePopupOutsideHandler({
  popupRef,
  triggerRef,
  onClose,
  isOpen = true,
}: { ... })
```

- **Inputs**
  - `popupRef`: element of the popup.
  - `triggerRef`: optional button or ref that opened the popup.
  - `onClose`: callback when outside click occurs.
  - `isOpen`: whether the handler is active.
- **Outputs**
  None (side effect hook).
- **Lifecycle**
  Adds a `mousedown` listener when open and removes it on cleanup.
- **Exceptions**
  None.

### `useWindowSize`

_File: `src/hooks/ui/useWindowSize.ts`_

```ts
export function useWindowSize<T extends HTMLElement = HTMLElement>(ref: RefObject<T | null>);
```

- **Inputs**
  - `ref`: DOM element reference.
- **Outputs**
  `DOMRect | null` describing the element's bounding box.
- **Lifecycle**
  Measures the rect on mount and updates on window resize.
- **Exceptions**
  None.
- **Example**

```ts
const rect = useWindowSize(divRef);
```

---

All hooks are re-exported through their respective `index.ts` files so they can be imported with:

```ts
import { usePlanner, useBudget } from '@/hooks';
```
