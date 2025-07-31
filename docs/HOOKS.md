# Hooks Reference

This document outlines the available custom hooks in the project. Each section details the signature, expected inputs and outputs, lifecycle behaviors, thrown exceptions, and example usage.

### `useBudget`

_File: `src/hooks/useBudget.ts`_

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

### `useTripRange`

_File: `src/hooks/useTripRange.ts`_

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

### `fetchCatalog`

_File: `src/hooks/fetchCatalog.ts`_

```ts
export async function fetchCatalog(dest: string, categories: string[]): Promise<CatalogApiResponse>;
```

- **Inputs**
  - `dest`: destination name.
  - `categories`: list of category filters (empty for all).
- **Outputs**
  Catalog activities from the API.
- **Lifecycle**
  Throws an `Error` when the request fails.

### `useCatalogActivities`

_File: `src/hooks/useCatalogActivities.ts`_

```ts
export function useCatalogActivities(planId: string | null, options: { enabled: boolean });
```

- **Inputs**
  - `planId`: planner identifier for the storage key.
  - `options.enabled`: whether the hook should read from storage.
- **Outputs**
  Raw catalog `activities` plus loading and error flags.
- **Lifecycle**
  Loads `catalog-${planId}` from `localStorage` when enabled.

### `useCatalog`

_File: `src/hooks/useCatalog.ts`_

```ts
export function useCatalog(planId: string | null, options: { enabled: boolean });
```

- **Inputs**
  - `planId`: planner identifier for the storage key.
  - `options.enabled`: whether the hook should load the cached data.
- **Outputs**
  Loading/error flags plus `days` (activities grouped by day).
- **Lifecycle**
  - Uses `useCatalogActivities` internally to load activities.
  - Memoizes transformation of activities into `DayPlan[]`.
- **Exceptions**
  None.
- **Example**

```ts
const { days, isLoading } = useCatalog(planId, { enabled: true });
```

### `useDestinationCatalog`

_File: `src/hooks/useDestinationCatalog.ts`_

```ts
export function useDestinationCatalog(enabled: boolean, planId: string | null);
```

- **Inputs**
  - `enabled`: whether loading is active.
  - `planId`: planner identifier for the storage key.
- **Outputs**
  Catalog `activities`, derived `categories`, loading and error flags.
- **Lifecycle**
  Loads activities from `useCatalogActivities` when enabled and memoizes category list.
- **Exceptions**
  Sets an error state when cached data is missing.
- **Example**

```ts
const { activities } = useDestinationCatalog(open, planId);
```

### `useDestinationAutocomplete`

_File: `src/hooks/useDestinationAutocomplete.ts`_

```ts
export function useDestinationAutocomplete(query: string);
```

- **Inputs**
  - `query`: user input text.
- **Outputs**
  Geoapify `results`, loading and error flags.
- **Lifecycle**
  Fetches `/api/autocomplete?text=` when the query has at least 4 characters.
  Results are cached for 1 minute and do not refetch on window focus.
- **Exceptions**
  Sets an error state when the request fails.

```ts
const { results } = useDestinationAutocomplete(query);
```

### `useDebounce`

_File: `src/hooks/useDebounce.ts`_

```ts
export function useDebounce<T>(value: T, delay?: number): T;
```

- **Inputs**
  - `value`: value to debounce.
  - `delay` (optional): wait time in milliseconds (defaults to `300`).
- **Outputs**
  Debounced value that updates after the delay passes.
- **Lifecycle**
  Updates the returned value only after the delay when inputs stop changing.
- **Exceptions**
  None.

```ts
const query = useDebounce(input);
```

### `useGeoapifySearch`

_File: `src/hooks/useGeoapifySearch.ts`_

```ts
export function useGeoapifySearch(query: string);
```

- **Inputs**
  - `query`: search text.
- **Outputs**
  Catalog `results`, loading and error flags.
- **Lifecycle**
  Fetches `/api/search?q=` when the query has at least 4 characters.
  The backend geocodes the text and searches around that point using the default radius.
- **Exceptions**
  Sets an error state when the request fails.

```ts
const { results } = useGeoapifySearch(query);
```

### `useActivitiesById`

_File: `src/hooks/useActivitiesById.ts`_

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

_File: `src/hooks/useActivityState.ts`_

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

_File: `src/hooks/useDragState.ts`_

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

_File: `src/hooks/useDnDPlanner.ts`_

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

_File: `src/hooks/usePlanParams.ts`_

```ts
export function usePlanParams(options?: { skipReplace?: boolean });
```

- **Outputs**
  `{ dest, planId, destCoords }` from the URL.
- **Lifecycle**
  Generates a plan id when missing and updates the URL unless `skipReplace` is `true`.
  - **Exceptions**
    None.

### `usePlanDaysStorage`

_File: `src/hooks/usePlanDaysStorage.ts`_

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
  Loads days from `localStorage` using the `days-${planId}` key and saves on change.
- **Exceptions**
  None.

### `usePlanner`

_File: `src/hooks/usePlanner.ts`_

```ts
export function usePlanner();
```

- **Inputs**
  None.
- **Outputs**
  Planner state: days, trip range utilities, drag-and-drop handlers, and more.
- **Lifecycle**
  - Composes `usePlanParams`, `usePlanDaysStorage`, `useTripRange`,
    `useDnDPlanner` and `useCatalog`.
  - Updates planner days whenever the trip range changes.
- **Exceptions**
  None internally; any catalog fetch errors are exposed via `error`.

### `usePlanTitle`

_File: `src/hooks/usePlanTitle.ts`_

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

### `useOnboardingCheck`

_File: `src/hooks/useOnboardingCheck.ts`_

```ts
export function useOnboardingCheck(planId: string);
```

- **Inputs**
  - `planId`: planner identifier used for the storage key.
- **Outputs**
  `{ showOnboarding, setShowOnboarding }`.
- **Lifecycle**
  Checks `localStorage` on mount and only shows onboarding once per plan.
- **Exceptions**
  None.

### `useSelectedActivity`

_File: `src/hooks/useSelectedActivity.ts`_

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

### `useCardPopups`

_File: `src/hooks/useCardPopups.ts`_

```ts
export function useCardPopups();
```

- **Inputs**
  None.
- **Outputs**
  Popup refs, `activePopup` state, a `setActivePopup` function and toggle handlers.
- **Lifecycle**
  Plain `useState` with no side effects.
- **Exceptions**
  None.

### `useEscapeKey`

_File: `src/hooks/useEscapeKey.ts`_

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

_File: `src/hooks/useKeyBinds.ts`_

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
  Adds a `keydown` listener when active and removes it on cleanup. The handler
  skips events if focus is inside an input, textarea or any content-editable
  element.
- **Exceptions**
  None.

### `useFlexibleRef`

_File: `src/hooks/useFlexibleRef.ts`_

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

_File: `src/hooks/usePopupOutsideHandler.ts`_

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

### `useElementRect`

_File: `src/hooks/useElementRect.ts`_

```ts
export function useElementRect<T extends HTMLElement = HTMLElement>(ref: RefObject<T | null>);
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
const rect = useElementRect(divRef);
```

---

All hooks are re-exported through their respective `index.ts` files so they can be imported with:

```ts
import { usePlanner, useBudget } from '@/hooks';
```
