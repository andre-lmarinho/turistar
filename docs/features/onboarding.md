# Onboarding Feature

Guides new users through a modal carousel on first visit to a plan.

```ts
import { OnboardingModal } from '@/features/onboarding';
```

## Components

### OnboardingModal
- **Location:** [`src/features/onboarding/components/OnboardingModal.tsx`](../../src/features/onboarding/components/OnboardingModal.tsx)
- **Responsibility:** Modal wrapper that displays onboarding content.
- **Props:** none
- **State:** none
- **External hooks:** `useOnboardingContext`, `useEscapeKey`
- **Side-effects:** none
- **Accessibility:** Dialog with labelled title and close button
- **Interactions:** Opens when `showOnboarding` is true and closes on user action
- **Performance notes:** none

### OnboardingCarousel
- **Location:** [`src/features/onboarding/components/OnboardingCarousel.tsx`](../../src/features/onboarding/components/OnboardingCarousel.tsx)
- **Responsibility:** Swipeable carousel of onboarding steps.
- **Props:** `{ baseWidth?: number; onFinish?: () => void }`
- **State:** `currentIndex`
- **External hooks:** `useMotionValue`, `useTransform`
- **Side-effects:** none
- **Accessibility:** Carousel region with previous/next controls and tablist dots
- **Interactions:** Drag, click arrows or dots to navigate steps
- **Performance notes:** Uses framer-motion for smooth transitions

## Hooks

### OnboardingContext
- **Location:** [`src/features/onboarding/hooks/OnboardingContext.tsx`](../../src/features/onboarding/hooks/OnboardingContext.tsx)
- **Responsibility:** React context provider tracking whether the modal is shown.
- **Signature:** `OnboardingProvider` exposes `useOnboardingContext()`
- **Inputs:** `{ planId: string; children: ReactNode }`
- **Outputs:** `{ showOnboarding: boolean; setShowOnboarding: (v: boolean) => void }`
- **Lifecycle:** Uses `useOnboardingCheck` to initialize visibility
- **Exceptions:** Throws if used outside provider
- **Example:**
  ```tsx
  <OnboardingProvider planId={planId}>{children}</OnboardingProvider>
  ```

### useOnboardingCheck
- **Location:** [`src/features/onboarding/hooks/useOnboardingCheck.ts`](../../src/features/onboarding/hooks/useOnboardingCheck.ts)
- **Responsibility:** Determines if onboarding should appear, storing flags in `localStorage`.
- **Signature:** `useOnboardingCheck(planId: string)`
- **Inputs:** `planId`
- **Outputs:** `{ showOnboarding: boolean; setShowOnboarding: (v: boolean) => void }`
- **Lifecycle:** Reads and writes a `planner-onboarding-shown-<id>` key in `localStorage`
- **Exceptions:** none
- **Example:**
  ```ts
  const { showOnboarding } = useOnboardingCheck(planId);
  ```

## Services

_None_

