# Component Overview

This document summarizes each React component in the repository. It follows the structure demonstrated in `PlannerClient` as a reference.

## Planner Components

### LoadingScreen

- **Location:** `src/components/LoadingScreen.tsx`
- **Responsibility:** Full-screen loading indicator with mascot image.
- **Props:** `{ text?: string }` – optional status message.
- **State:** none
- **External Hooks:** none
- **Side-effects:** none
- **Accessibility:** `role="status"`, `aria-busy`, live region for text, decorative mascot image marked with `role="presentation"`.
- **Interactions:** none
- **Performance notes:** simple component

### Providers

- **Location:** `src/components/Providers.tsx`
- **Responsibility:** Wraps the app with React Query provider and devtools (in development).
- **Props:** `{ children: React.ReactNode }`
- **State:** `queryClient` stored via `useState`
- **External Hooks:** none
- **Side-effects:** none
- **Accessibility:** n/a
- **Interactions:** none
- **Performance notes:** creates a single QueryClient per tab

---

## Budget Components

### BudgetItem

- **Location:** `src/components/budget/BudgetItem.tsx`
- **Responsibility:** Displays a single budget value with optional edit field.
- **Props:** `{ id, icon, label, amount, editable?, onChange? }`
- **State:** none
- **External Hooks:** none
- **Side-effects:** none
- **Accessibility:** labeled inputs or text, `role="group"`
- **Interactions:** emits value on change
- **Performance notes:** light component

### BudgetPanelHeader

- **Location:** `src/components/budget/BudgetPanelHeader.tsx`
- **Responsibility:** Summary header showing totals and category progress.
- **Props:** `{ budget, setBudget, totalSpent, difference, categoryTotals }`
- **State:** `budgetInput`
- **External Hooks:** none
- **Side-effects:** none
- **Accessibility:** form labels, `aria-label` values
- **Interactions:** updates numbers on blur
- **Performance notes:** stateless calculations

### CategoryProgressBar

- **Location:** `src/components/budget/CategoryProgressBar.tsx`
- **Responsibility:** Shows progress bar for a spending category.
- **Props:** `{ category, value, total, colorIndex }`
- **State:** none
- **External Hooks:** none
- **Side-effects:** none
- **Accessibility:** `role="progressbar"` with proper attributes
- **Interactions:** none
- **Performance notes:** computed percent only

### ExpenseTable

- **Location:** `src/components/budget/ExpenseTable.tsx`
- **Responsibility:** Editable table of budget entries.
- **Props:** list of entries and handlers
- **State:** `editIndex`, `editEntry`, input strings
- **External Hooks:** none
- **Side-effects:** synchronizes input when amount prop changes
- **Accessibility:** `role="table"`, captions, ARIA labels
- **Interactions:** add, edit, delete via callbacks
- **Performance notes:** none

### TableRowEdit / TableRowEntry / TableRowNew

- **Location:** `src/components/budget`
- **Responsibility:** Table row variants used by `ExpenseTable`.
- **Props:** entry data and callbacks
- **State:** none (except local input handling in `TableRowEdit`)
- **External Hooks:** none
- **Side-effects:** none
- **Accessibility:** labeled inputs and buttons
- **Interactions:** confirm/cancel editing, remove row, create new row
- **Performance notes:** minimal

### ActivitiesBudgetPopup

- **Location:** `src/components/budget/activities/ActivitiesBudget.tsx`
- **Responsibility:** Modal to batch-edit activity budgets.
- **Props:** `{ open, days, onUpdate, onClose }`
- **State:** `inputs`, `shouldAutoFocus`
- **External Hooks:** `useEscapeKey`
- **Side-effects:** resets inputs when opened
- **Accessibility:** `role="dialog"`, labels for fields
- **Interactions:** saves budgets on close
- **Performance notes:** uses `useMemo` to flatten activities

---

## Home Components

### FeaturePreview

- **Location:** `src/components/home/FeaturePreview.tsx`
- **Responsibility:** Simple figure with image, title and description.
- **Props:** `{ title, description, imgSrc }`
- **State:** none
- **External Hooks:** none
- **Side-effects:** none
- **Accessibility:** `role="group"`, alt text for image
- **Interactions:** none
- **Performance notes:** none

### WelcomeForm

- **Location:** `src/components/home/WelcomeForm.tsx`
- **Responsibility:** Landing form selecting travel dates.
- **Props:** none
- **State:** `range`, `error`
- **External Hooks:** `useRouter`
- **Side-effects:** none
- **Accessibility:** form labels, validation message
- **Interactions:** submits to `/planner` with query params
- **Performance notes:** none

---

## Onboarding Components

### OnboardingCarousel

- **Location:** `src/components/planner/onboarding/OnboardingCarousel.tsx`
- **Responsibility:** Animated carousel for onboarding steps.
- **Props:** options for width, autoplay, callbacks
- **State:** `isHovered`, `isResetting`, `currentIndex`
- **External Hooks:** `useMotionValue`, `useTransform`
- **Side-effects:** timers for autoplay
- **Accessibility:** `aria-roledescription="carousel"`, navigation dots
- **Interactions:** drag to switch slides, previous/next buttons
- **Performance notes:** uses framer-motion for transitions

### OnboardingModal

- **Location:** `src/components/planner/onboarding/OnboardingModal.tsx`
- **Responsibility:** Modal wrapper showing the carousel.
- **Props:** `{ open, onClose }`
- **State:** none
- **External Hooks:** `useEscapeKey`
- **Side-effects:** none
- **Accessibility:** focus-trap, dialog roles
- **Interactions:** closes on overlay click or ESC
- **Performance notes:** portal to `document.body`

---

## Planner Catalog Components

### CategoryFilterBar

- **Location:** `src/components/planner/catalog/CategoryFilterBar.tsx`
- **Responsibility:** Scrollable list of category pills with drag-to-scroll.
- **Props:** `{ categories, active, onToggle }`
- **State:** `isDragging`, scroll flags
- **External Hooks:** none
- **Side-effects:** event listeners for scroll visibility
- **Accessibility:** buttons, hidden scroll buttons
- **Interactions:** toggle categories, drag scroll
- **Performance notes:** none

### DestinationCard / DestinationCardGrid

- **Location:** `src/components/planner/catalog`
- **Responsibility:** Card display for catalog items and grid layout.
- **Props:** card info plus add/remove callbacks
- **State:** none
- **External Hooks:** none
- **Side-effects:** none
- **Accessibility:** alt text, ARIA labels
- **Interactions:** add/remove actions
- **Performance notes:** none

### DestinationFilterPanel

- **Location:** `src/components/planner/catalog/DestinationFilterPanel.tsx`
- **Responsibility:** Full catalog modal with search and filters.
- **Props:** `{ isOpen, onClose, onAdd, onRemove, addedIds? }`
- **State:** handled in `useDestinationFilter`
- **External Hooks:** `useDestinationFilter`, `useEscapeKey`
- **Side-effects:** portal rendering
- **Accessibility:** dialog roles, focus trap
- **Interactions:** filter changes, add/remove actions
- **Performance notes:** none

### DestinationHeader

- **Location:** `src/components/planner/catalog/DestinationHeader.tsx`
- **Responsibility:** Header controls for filter panel (categories, search, sort).
- **Props:** categories, active set, handlers
- **State:** none
- **External Hooks:** none
- **Side-effects:** none
- **Accessibility:** labeled search input
- **Interactions:** toggles categories, sorts results
- **Performance notes:** none

### SortSelector

- **Location:** `src/components/planner/catalog/SortSelector.tsx`
- **Responsibility:** Select element for sort mode (name, duration etc.).
- **Props:** `{ value, onChange }`
- **State:** none
- **External Hooks:** none
- **Side-effects:** none
- **Accessibility:** label for select
- **Interactions:** call `onChange` on selection
- **Performance notes:** none

---

## Planner Drag-and-Drop Components

### ActivityCard / ActivityCardBase / ActivityCardEditing

- **Location:** `src/components/planner/dnd`
- **Responsibility:** Activity card display. Editing state handled by `useActivityCardEditor` hook.
- **Props:** activity data, callbacks for updates, color, catalog search
- **State:** managed within the hook – draft title, overlay position
- **External Hooks:** `useActivityCardEditor`, `useCardPopups`, `useWindowSize`, `useFlexibleRef`
- **Side-effects:** portal overlays, focusing inputs
- **Accessibility:** keyboard interaction, ARIA buttons
- **Interactions:** click/drag to edit, color and date pickers
- **Performance notes:** compute overlay rect; watch window size

### DayColumn

- **Location:** `src/components/planner/dnd/DayColumn.tsx`
- **Responsibility:** Droppable column listing a day’s activities.
- **Props:** `{ day, days, onSelectActivity, onAddActivity, ... }`
- **State:** none
- **External Hooks:** `useDroppable`
- **Side-effects:** none
- **Accessibility:** `role="list"` with list items
- **Interactions:** add card buttons, drag-and-drop
- **Performance notes:** none

### DragOverlayFallback

- **Location:** `src/components/planner/dnd/DragOverlayFallback.tsx`
- **Responsibility:** Placeholder shown when an item is dragged but not rendered.
- **Props:** none
- **State:** none
- **External Hooks:** none
- **Side-effects:** none
- **Accessibility:** visually hidden text
- **Interactions:** none
- **Performance notes:** none

### SortableItem

- **Location:** `src/components/planner/dnd/SortableItem.tsx`
- **Responsibility:** Wrapper to make an activity draggable.
- **Props:** activity data, handler callbacks, options for overlay
- **State:** none
- **External Hooks:** `useSortable`
- **Side-effects:** none
- **Accessibility:** ARIA attributes for drag
- **Interactions:** handles drag start/end events
- **Performance notes:** minimal
- **Visual behavior:** leaves a dashed placeholder while dragging and the overlay
  card uses a translucent glass style

---

## Planner Modal Components

### ActivityModal / ActivityModalHeader / ActivityModalForm

- **Location:** `src/components/planner/modal`
- **Responsibility:** Modal for editing an activity (header tools and form).
- **Props:** various: open state, activity data, callbacks for delete/save/etc.
- **State:** `draft` state in modal
- **External Hooks:** `useEscapeKey`
- **Side-effects:** portal rendering, updates draft when activity changes
- **Accessibility:** focus trap, ARIA labels, keyboard shortcuts
- **Interactions:** edit fields, change day/position, pick color
- **Performance notes:** none

---

## UI Utility Components

### DatePicker

- **Location:** `src/components/ui/DatePicker.tsx`
- **Responsibility:** Range picker built on `react-day-picker`.
- **Props:** value, onChange, error state
- **State:** none
- **External Hooks:** none
- **Side-effects:** none
- **Accessibility:** labeled inputs
- **Interactions:** select start/end dates
- **Performance notes:** none

### DateRangePickerIcon

- **Location:** `src/components/ui/DatePicker.tsx`
- **Responsibility:** Compact icon button version of the range picker.
- **Props:** value, onChange, `className`
- **State:** internal open state
- **External Hooks:** none
- **Side-effects:** none
- **Accessibility:** labeled button and calendar popup

### Spinner

- **Location:** `src/components/ui/Spinner.tsx`
- **Responsibility:** SVG spinner icon.
- **Props:** `className`
- **State:** none
- **External Hooks:** none
- **Side-effects:** none
- **Accessibility:** `aria-hidden`
- **Interactions:** none
- **Performance notes:** none

### Button and Tooltip

- **Location:** `src/components/ui/button.tsx`, `buttonTooltip.tsx`
- **Responsibility:** Reusable button with variants and optional tooltip.
- **Props:** variant, size, disabled, etc.
- **State:** none
- **External Hooks:** none
- **Side-effects:** none
- **Accessibility:** ARIA labels for icon buttons
- **Interactions:** click handlers
- **Performance notes:** uses `class-variance-authority`
- **Layout notes:** tooltip is set to avoid expanding the viewport

### Specialized Buttons

- **Location:** `src/components/ui/button-especials` and `button-icons`
- **Responsibility:** Domain-specific buttons (AddCardButton, ModeToggleButton, etc.).
- **Props:** vary per component (onAdd, onDelete, mode selection…)
- **State:** mostly none (ModeToggleButton uses refs and motion values)
- **External Hooks:** some use `framer-motion`
- **Side-effects:** none
- **Accessibility:** proper aria labels
- **Interactions:** various click actions
- **Performance notes:** ModeToggleButton animates using framer motion
- **Variants:** `OpenPanelButton` and `OpenPanelIcon` provide full and icon-only triggers for the destination panel

### Input, Popover and Popups

- **Location:** `src/components/ui/input.tsx`, `popover.tsx`, `popups/*`
- **Responsibility:** Reusable form elements and small popups (color picker, day picker, info tooltip, catalog search).
- **Props:** components accept standard form props and callback handlers.
- **State:** mostly uncontrolled; some local input state for popups.
- **External Hooks:** `useEscapeKey` in popups.
- **Side-effects:** portal rendering for popups.
- **Accessibility:** labelled inputs, dialogs with focus management.
- **Interactions:** open/close, select options
- **Performance notes:** none

---

## Planner Page Components

### PlannerClient

- **Location:** `src/app/planner/PlannerClient.tsx`
- **Responsibility:** Top-level planner page component orchestrating drag-and-drop and budget view.
- **Props:** none
- **State:** `isPanelOpen`, `mode`, `showOnboarding`
- **External Hooks:** `usePlanner`, `usePlanTitle`, `useSelectedActivity`, `useActivitiesById`
- **Side-effects:** none
- **Accessibility:** input IDs, focus on select, ARIA labels
- **Interactions:** numerous callbacks: `handleDragStart`, `handleDragEnd`, etc.
- **Performance notes:** `useMemo` for totals and added ID set

### PlannerBoard

- **Location:** `src/app/planner/PlannerBoard.tsx`
- **Responsibility:** Renders droppable board of days using DnD Kit.
- **Props:** days array, DnD sensors, callbacks
- **State:** none
- **External Hooks:** `useActivitiesById`
- **Side-effects:** none
- **Accessibility:** `role="list"` and `DragOverlay` with labels
- **Interactions:** drag start/over/end events
- **Performance notes:** memoizes activity lookups

### PlannerControls

- **Location:** `src/components/planner/PlannerControls.tsx`
- **Responsibility:** Wrapper for the view mode switch and trip date range picker.
- **Props:** `{ mode, onModeChange, range, onRangeChange }`
- **State:** none
- **External Hooks:** none
- **Side-effects:** none
- **Accessibility:** passes ARIA props to child buttons and pickers
- **Interactions:** toggles modes, selects date ranges
- **Performance notes:** none

### BudgetPanel

- **Location:** `src/app/planner/BudgetPanel.tsx`
- **Responsibility:** Panel displaying and editing trip budget.
- **Props:** `{ planId, activitiesTotal, days, onUpdateBudget }`
- **State:** `editActivities` toggle
- **External Hooks:** `useBudget`
- **Side-effects:** none
- **Accessibility:** region with heading, labels
- **Interactions:** open activities popup, update entries
- **Performance notes:** none

### MapView

- **Location:** `src/app/planner/MapView.tsx`
- **Responsibility:** Interactive itinerary map using Leaflet to display markers and paths.
- **Props:** `{ days: DayPlan[], onSelectActivity: (activity) => void }`
- **Accessibility:** `<MapContainer>` labeled with `aria-label="Itinerary map"`.
- **Performance notes:** Fits bounds to markers when coordinates change.
