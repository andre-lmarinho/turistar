# Home Feature

Landing experience for starting a trip and previewing capabilities.

```ts
import { Hero, PlanForm } from '@/features/home';
```

## Components

### Hero
- **Location:** [`src/features/home/components/Hero.tsx`](../../src/features/home/components/Hero.tsx)
- **Responsibility:** Highlights the Rome inspiration itinerary.
- **Props:** none
- **State:** none
- **External hooks:** none
- **Side-effects:** none
- **Accessibility:** Uses semantic heading and link button
- **Interactions:** Users click to view the Rome inspiration plan
- **Performance notes:** none

### PlanForm
- **Location:** [`src/features/home/components/PlanForm.tsx`](../../src/features/home/components/PlanForm.tsx)
- **Responsibility:** Captures destination and dates to create a new plan.
- **Props:** none
- **State:** `range`, `dest`, `coords`, `title`, `error`, `loading`
- **External hooks:** `useRouter`
- **Side-effects:** Navigates to `/planner` after server action `createPlan` (Supabase RPC `create_full_plan`)
- **Accessibility:** Fieldsets with legends, error messaging via `role="alert"`
- **Interactions:** Users select dates and destination then submit to start planning
- **Performance notes:** none

### DestinationInput
- **Location:** [`src/features/home/components/DestinationInput.tsx`](../../src/features/home/components/DestinationInput.tsx)
- **Responsibility:** Autocomplete field for destination search.
- **Props:** `{ value: string; onChange: (val: string | PlaceSelection) => void }`
- **State:** `open`, `active`
- **External hooks:** `useDebounce`, `useDestinationAutocomplete`
- **Side-effects:** none
- **Accessibility:** Implements a combobox with `aria-*` attributes and keyboard navigation
- **Interactions:** Handles arrow keys and selection from suggestion list
- **Performance notes:** none

### FeaturePreview
- **Location:** [`src/features/home/components/FeaturePreview.tsx`](../../src/features/home/components/FeaturePreview.tsx)
- **Responsibility:** Static gallery showcasing planner features.
- **Props:** none
- **State:** none
- **External hooks:** none
- **Side-effects:** none
- **Accessibility:** Images marked as decorative where appropriate
- **Interactions:** none
- **Performance notes:** none

### InspirationLink
- **Location:** [`src/features/home/components/InspirationLink.tsx`](../../src/features/home/components/InspirationLink.tsx)
- **Responsibility:** Links to sample inspiration itineraries.
- **Props:** none
- **State:** none
- **External hooks:** none
- **Side-effects:** none
- **Accessibility:** Uses semantic links for navigation
- **Interactions:** Users click a city to open its inspiration plan
- **Performance notes:** none

## Hooks

_None_

## Services

_None_

