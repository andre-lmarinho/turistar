# Planner Feature

Handles drag-and-drop itinerary building, catalog searches, and activity editing.

```ts
import { PlannerControls } from '@/features/planner';
```

## Components

### PlannerControls
- **Location:** [`src/features/planner/components/PlannerControls.tsx`](../../src/features/planner/components/PlannerControls.tsx)
- **Responsibility:** Switches between planner views and controls the active date range.
- **Props:** `{ mode: 'planner' | 'map' | 'budget'; onModeChange: (mode) => void }`
- **State:** none
- **External hooks:** none
- **Side-effects:** none
- **Accessibility:** Buttons announce selected mode
- **Interactions:** Users toggle between board, map and budget modes
- **Performance notes:** none

### ActivityCard
- **Location:** [`src/features/planner/components/dnd/ActivityCard.tsx`](../../src/features/planner/components/dnd/ActivityCard.tsx)
- **Responsibility:** Draggable card representing an activity with inline editing and color selection.
- **Props:** `ActivityCardProps` including handlers for day/position changes and deletion.
- **State:** `editedImageUrl`
- **External hooks:** `useActivityCardEditor`, `useCardColors`
- **Side-effects:** Saves edits and triggers callbacks on changes
- **Accessibility:** Focusable card with edit button and drag handle
- **Interactions:** Drag, edit title/image, change color, delete
- **Performance notes:** none

### ActivityCardEditing
- **Location:** [`src/features/planner/components/dnd/ActivityCardEditing.tsx`](../../src/features/planner/components/dnd/ActivityCardEditing.tsx)
- **Responsibility:** Internal editing state for an activity card.
- **Props:** `{ title: string; imageUrl?: string; onSave: (title: string) => void }`
- **State:** `draft`
- **External hooks:** `useActivityCardEditor`
- **Side-effects:** none
- **Accessibility:** Inputs labelled for title and image
- **Interactions:** Users edit title and image then save or cancel
- **Performance notes:** none

### DayColumn
- **Location:** [`src/features/planner/components/dnd/DayColumn.tsx`](../../src/features/planner/components/dnd/DayColumn.tsx)
- **Responsibility:** Column of activities for a single day with droppable area.
- **Props:** `{ day: DayPlan }`
- **State:** none
- **External hooks:** `useDroppable` from DnD Kit
- **Side-effects:** none
- **Accessibility:** Column labelled by day heading
- **Interactions:** Accepts dragged activities
- **Performance notes:** none

### SortableItem
- **Location:** [`src/features/planner/components/dnd/SortableItem.tsx`](../../src/features/planner/components/dnd/SortableItem.tsx)
- **Responsibility:** Wrapper enabling drag-and-drop sorting for each activity.
- **Props:** `{ id: string; index: number }`
- **State:** none
- **External hooks:** `useSortable`
- **Side-effects:** none
- **Accessibility:** Provides attributes for keyboard dragging
- **Interactions:** Items respond to drag sensors
- **Performance notes:** none

### CategoryFilterBar
- **Location:** [`src/features/planner/components/catalog/CategoryFilterBar.tsx`](../../src/features/planner/components/catalog/CategoryFilterBar.tsx)
- **Responsibility:** Displays available categories and selected filters.
- **Props:** `{ selected: string[]; onToggle: (id: string) => void }`
- **State:** none
- **External hooks:** none
- **Side-effects:** none
- **Accessibility:** Buttons with pressed state for each category
- **Interactions:** Toggle categories to filter catalog
- **Performance notes:** none

### CategorySelection
- **Location:** [`src/features/planner/components/catalog/CategorySelection.tsx`](../../src/features/planner/components/catalog/CategorySelection.tsx)
- **Responsibility:** Renders selectable destination categories.
- **Props:** `{ categories: CatalogCategory[]; onChange: (ids: string[]) => void }`
- **State:** `selected`
- **External hooks:** none
- **Side-effects:** none
- **Accessibility:** Checkbox group with labels
- **Interactions:** Users choose categories to refine catalog
- **Performance notes:** none

### DestinationCard
- **Location:** [`src/features/planner/components/catalog/DestinationCard.tsx`](../../src/features/planner/components/catalog/DestinationCard.tsx)
- **Responsibility:** Card preview for a catalog destination.
- **Props:** `{ activity: CatalogActivity; onAdd: () => void }`
- **State:** none
- **External hooks:** none
- **Side-effects:** none
- **Accessibility:** Button semantics with title and image alt text
- **Interactions:** Clicking adds activity to plan
- **Performance notes:** none

### DestinationCardGrid
- **Location:** [`src/features/planner/components/catalog/DestinationCardGrid.tsx`](../../src/features/planner/components/catalog/DestinationCardGrid.tsx)
- **Responsibility:** Responsive grid for catalog results.
- **Props:** `{ activities: CatalogActivity[]; onAdd: (a: CatalogActivity) => void }`
- **State:** none
- **External hooks:** none
- **Side-effects:** none
- **Accessibility:** Grid list of destination cards
- **Interactions:** Users browse and add items
- **Performance notes:** none

### DestinationFilterPanel
- **Location:** [`src/features/planner/components/catalog/DestinationFilterPanel.tsx`](../../src/features/planner/components/catalog/DestinationFilterPanel.tsx)
- **Responsibility:** Side panel with search and category filters for the catalog.
- **Props:** `{ onSearch: (q: string) => void }`
- **State:** `query`
- **External hooks:** none
- **Side-effects:** none
- **Accessibility:** Search input labelled and panel marked as complementary region
- **Interactions:** Users search catalog and toggle category selection
- **Performance notes:** none

### DestinationHeader
- **Location:** [`src/features/planner/components/catalog/DestinationHeader.tsx`](../../src/features/planner/components/catalog/DestinationHeader.tsx)
- **Responsibility:** Heading and sort controls for catalog results.
- **Props:** `{ total: number }`
- **State:** none
- **External hooks:** none
- **Side-effects:** none
- **Accessibility:** Displays total count in heading
- **Interactions:** none
- **Performance notes:** none

### DestinationResultsList
- **Location:** [`src/features/planner/components/catalog/DestinationResultsList.tsx`](../../src/features/planner/components/catalog/DestinationResultsList.tsx)
- **Responsibility:** Scrollable list of catalog destinations.
- **Props:** `{ activities: CatalogActivity[]; onAdd: (a: CatalogActivity) => void }`
- **State:** none
- **External hooks:** none
- **Side-effects:** none
- **Accessibility:** List with scrollable region labelled
- **Interactions:** Users choose activities to add
- **Performance notes:** none

### ActivityModal
- **Location:** [`src/features/planner/components/modal/ActivityModal.tsx`](../../src/features/planner/components/modal/ActivityModal.tsx)
- **Responsibility:** Modal wrapper for editing an activity.
- **Props:** `{ open: boolean; onClose: () => void }`
- **State:** none
- **External hooks:** none
- **Side-effects:** none
- **Accessibility:** Modal dialog with labelled title
- **Interactions:** Opens for editing and closes on save or cancel
- **Performance notes:** none

### ActivityModalForm
- **Location:** [`src/features/planner/components/modal/ActivityModalForm.tsx`](../../src/features/planner/components/modal/ActivityModalForm.tsx)
- **Responsibility:** Form to edit title, budget and image.
- **Props:** `{ draft: ActivityDraft; onSubmit: () => void }`
- **State:** internal draft fields
- **External hooks:** none
- **Side-effects:** Calls `onSubmit` on form submission
- **Accessibility:** Inputs labelled and grouped
- **Interactions:** Users update fields then submit
- **Performance notes:** none

### ActivityModalHeader
- **Location:** [`src/features/planner/components/modal/ActivityModalHeader.tsx`](../../src/features/planner/components/modal/ActivityModalHeader.tsx)
- **Responsibility:** Displays modal heading and close action.
- **Props:** `{ title: string; onClose: () => void }`
- **State:** none
- **External hooks:** none
- **Side-effects:** none
- **Accessibility:** Heading element linked to dialog
- **Interactions:** Close button dismisses modal
- **Performance notes:** none

## Hooks

### PlannerContext
- **Location:** [`src/features/planner/hooks/PlannerContext.tsx`](../../src/features/planner/hooks/PlannerContext.tsx)
- **Responsibility:** React context provider exposing planner state and actions.
- **Signature:** `PlannerProvider` with `usePlannerContext()`
- **Inputs:** `{ planId: string; initialDays?: DayPlan[]; children: ReactNode }`
- **Outputs:** Planner state, drag handlers, selection utilities
- **Lifecycle:** Initializes planner via `usePlanner`
- **Exceptions:** Throws if used outside provider
- **Example:**
  ```tsx
  <PlannerProvider planId="1">{children}</PlannerProvider>
  ```

### usePlanner
- **Location:** [`src/features/planner/hooks/usePlanner.ts`](../../src/features/planner/hooks/usePlanner.ts)
- **Responsibility:** High-level hook combining Supabase persistence and planner logic.
- **Signature:** `usePlanner({ planId: string, initialDays?: DayPlan[] })`
- **Inputs:** `planId`, optional `initialDays`
- **Outputs:** Days array, handlers for drag-and-drop and activity CRUD
- **Lifecycle:** Loads persisted days and syncs on update
- **Exceptions:** none
- **Example:**
  ```ts
  const planner = usePlanner({ planId, initialDays });
  ```

### useTripRange
- **Location:** [`src/features/planner/hooks/useTripRange.ts`](../../src/features/planner/hooks/useTripRange.ts)
- **Responsibility:** Manages the current date range for the plan.
- **Signature:** `useTripRange(initialDays?: DayPlan[])`
- **Inputs:** optional initial days
- **Outputs:** `{ start: Date; end: Date; setRange: (s: Date, e: Date) => void }`
- **Lifecycle:** Reads from URL search params and updates when range changes
- **Exceptions:** none
- **Example:**
  ```ts
  const { start, end } = useTripRange(days);
  ```

### useActivityCardEditor
- **Location:** [`src/features/planner/hooks/useActivityCardEditor.ts`](../../src/features/planner/hooks/useActivityCardEditor.ts)
- **Responsibility:** Handles editing state for activity cards.
- **Signature:** `useActivityCardEditor({ title: string; imageUrl?: string; onTitleSave?: (t:string)=>void })`
- **Inputs:** initial title and image
- **Outputs:** editing flags, draft data and save/cancel handlers
- **Lifecycle:** Manages local state and refs for editing overlay
- **Exceptions:** none
- **Example:**
  ```ts
  const editor = useActivityCardEditor({ title });
  ```

### useDnDPlanner
- **Location:** [`src/features/planner/hooks/useDnDPlanner.ts`](../../src/features/planner/hooks/useDnDPlanner.ts)
- **Responsibility:** Sets up drag-and-drop sensors and event handlers.
- **Signature:** `useDnDPlanner()`
- **Inputs:** none
- **Outputs:** sensors, collision detection and drag callbacks
- **Lifecycle:** Initializes DnD Kit sensors on mount
- **Exceptions:** none
- **Example:**
  ```ts
  const { sensors } = useDnDPlanner();
  ```

### useActivitiesById
- **Location:** [`src/features/planner/hooks/useActivitiesById.ts`](../../src/features/planner/hooks/useActivitiesById.ts)
- **Responsibility:** Utility hook to look up activities by identifier.
- **Signature:** `useActivitiesById(days: DayPlan[])`
- **Inputs:** array of day plans
- **Outputs:** map of activity id to activity
- **Lifecycle:** Recomputes when days change
- **Exceptions:** none
- **Example:**
  ```ts
  const map = useActivitiesById(days);
  ```

### useSelectedActivity
- **Location:** [`src/features/planner/hooks/useSelectedActivity.ts`](../../src/features/planner/hooks/useSelectedActivity.ts)
- **Responsibility:** Tracks the currently focused activity card.
- **Signature:** `useSelectedActivity()`
- **Inputs:** none
- **Outputs:** `{ selectedActivity, setSelectedActivity, changeDay, addBlankAndSelect, closeModal, save, deleteActivity, changeColor }`
- **Lifecycle:** Manages selection state
- **Exceptions:** none
- **Example:**
  ```ts
  const { selectedActivity } = useSelectedActivity();
  ```

### usePlanTitle
- **Location:** [`src/features/planner/hooks/usePlanTitleSupabase.ts`](../../src/features/planner/hooks/usePlanTitleSupabase.ts)
- **Responsibility:** Syncs plan titles with Supabase.
- **Signature:** `usePlanTitle(planId: string)`
- **Inputs:** `planId`
- **Outputs:** `{ title, setTitle }`
- **Lifecycle:** Loads and updates title in Supabase
- **Exceptions:** none
- **Example:**
  ```ts
  const { title, setTitle } = usePlanTitle(id);
  ```

### usePlanDays
- **Location:** [`src/features/planner/hooks/usePlanDaysSupabase.ts`](../../src/features/planner/hooks/usePlanDaysSupabase.ts)
- **Responsibility:** Loads and persists day data in Supabase.
- **Signature:** `usePlanDays(planId: string)`
- **Inputs:** `planId`
- **Outputs:** `{ data, persistDays }`
- **Lifecycle:** Fetches days and provides mutation
- **Exceptions:** none
- **Example:**
  ```ts
  const { data, persistDays } = usePlanDays(id);
  ```

### useCatalog
- **Location:** [`src/features/planner/hooks/catalog/useCatalog.ts`](../../src/features/planner/hooks/catalog/useCatalog.ts)
- **Responsibility:** Retrieves available catalog data.
- **Signature:** `useCatalog()`
- **Inputs:** none
- **Outputs:** catalog categories and destinations
- **Lifecycle:** Fetches once on mount
- **Exceptions:** none
- **Example:**
  ```ts
  const catalog = useCatalog();
  ```

### useCatalogActivities
- **Location:** [`src/features/planner/hooks/catalog/useCatalogActivities.ts`](../../src/features/planner/hooks/catalog/useCatalogActivities.ts)
- **Responsibility:** Fetches catalog activities for a destination.
- **Signature:** `useCatalogActivities(dest: string)`
- **Inputs:** destination id
- **Outputs:** activities list and loading state
- **Lifecycle:** Fetches when destination changes
- **Exceptions:** none
- **Example:**
  ```ts
  const { activities } = useCatalogActivities(dest);
  ```

### useDestinationCatalog
- **Location:** [`src/features/planner/hooks/catalog/useDestinationCatalog.ts`](../../src/features/planner/hooks/catalog/useDestinationCatalog.ts)
- **Responsibility:** Manages catalog state for a selected destination.
- **Signature:** `useDestinationCatalog()`
- **Inputs:** none
- **Outputs:** search helpers and results
- **Lifecycle:** Coordinates catalog fetching hooks
- **Exceptions:** none
- **Example:**
  ```ts
  const catalog = useDestinationCatalog();
  ```

### useDestinationAutocomplete
- **Location:** [`src/features/planner/hooks/catalog/useDestinationAutocomplete.ts`](../../src/features/planner/hooks/catalog/useDestinationAutocomplete.ts)
- **Responsibility:** Autocomplete search for destinations using Geoapify.
- **Signature:** `useDestinationAutocomplete(query: string, options?: { enabled: boolean })`
- **Inputs:** query string
- **Outputs:** `{ results, loading, error }`
- **Lifecycle:** Calls Geoapify API when enabled
- **Exceptions:** none
- **Example:**
  ```ts
  const { results } = useDestinationAutocomplete(text);
  ```

### useGeoapifySearch
- **Location:** [`src/features/planner/hooks/catalog/useGeoapifySearch.ts`](../../src/features/planner/hooks/catalog/useGeoapifySearch.ts)
- **Responsibility:** Low-level helper for invoking Geoapify APIs.
- **Signature:** `useGeoapifySearch()`
- **Inputs:** none
- **Outputs:** `{ search: (url: string) => Promise<any> }`
- **Lifecycle:** Provides memoized fetch wrapper
- **Exceptions:** none
- **Example:**
  ```ts
  const { search } = useGeoapifySearch();
  ```

### fetchCatalog
- **Location:** [`src/features/planner/hooks/catalog/fetchCatalog.ts`](../../src/features/planner/hooks/catalog/fetchCatalog.ts)
- **Responsibility:** Fetches catalog activities on the server.
- **Signature:** `fetchCatalog(dest: string)`
- **Inputs:** destination id
- **Outputs:** Promise of activities
- **Lifecycle:** server-side fetch
- **Exceptions:** throws on network errors
- **Example:**
  ```ts
  const acts = await fetchCatalog(dest);
  ```

### fetchAutocomplete
- **Location:** [`src/features/planner/hooks/catalog/fetchAutocomplete.ts`](../../src/features/planner/hooks/catalog/fetchAutocomplete.ts)
- **Responsibility:** Server call returning destination suggestions.
- **Signature:** `fetchAutocomplete(text: string)`
- **Inputs:** search text
- **Outputs:** Promise of suggestion results
- **Lifecycle:** server-side fetch
- **Exceptions:** throws on network errors
- **Example:**
  ```ts
  const suggestions = await fetchAutocomplete('rome');
  ```

### fetchSearch
- **Location:** [`src/features/planner/hooks/catalog/fetchSearch.ts`](../../src/features/planner/hooks/catalog/fetchSearch.ts)
- **Responsibility:** Performs a Geoapify search request.
- **Signature:** `fetchSearch(url: string)`
- **Inputs:** request URL
- **Outputs:** Promise of search results
- **Lifecycle:** server-side fetch
- **Exceptions:** throws on network errors
- **Example:**
  ```ts
  const results = await fetchSearch(url);
  ```

## Services

### buildDaysFromInspirationData
- **Location:** [`src/features/planner/services/buildDaysFromInspirationData.ts`](../../src/features/planner/services/buildDaysFromInspirationData.ts)
- **Responsibility:** Converts example data into initial day plans.

### formatDayPlan
- **Location:** [`src/features/planner/services/formatDayPlan.ts`](../../src/features/planner/services/formatDayPlan.ts)
- **Responsibility:** Normalizes day plan data from the API.

### initialDays
- **Location:** [`src/features/planner/services/initialDays.ts`](../../src/features/planner/services/initialDays.ts)
- **Responsibility:** Creates baseline day objects for a new plan.

### cloneDays
- **Location:** [`src/features/planner/services/cloneDays.ts`](../../src/features/planner/services/cloneDays.ts)
- **Responsibility:** Deeply clones planner day structures.

### moveActivityToDay
- **Location:** [`src/features/planner/services/moveActivityToDay.ts`](../../src/features/planner/services/moveActivityToDay.ts)
- **Responsibility:** Moves an activity to a different day.

### moveActivityPosition
- **Location:** [`src/features/planner/services/moveActivityPosition.ts`](../../src/features/planner/services/moveActivityPosition.ts)
- **Responsibility:** Reorders an activity within a day.

### normalizeAmount
- **Location:** [`src/shared/utils/normalizeAmount.ts`](../../src/shared/utils/normalizeAmount.ts)
- **Responsibility:** Parses currency strings into numbers.

### syncDaysWithTripRange
- **Location:** [`src/features/planner/services/syncDaysWithTripRange.ts`](../../src/features/planner/services/syncDaysWithTripRange.ts)
- **Responsibility:** Adjusts day data when the trip range changes.

