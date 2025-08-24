// src/features/onboarding/hooks/OnboardingContext.tsx
'use client';

import { createContextProvider } from '@/shared/context/createContextProvider';
import { useOnboardingCheck } from './useOnboardingCheck';

const [OnboardingProvider, useOnboardingContext] = createContextProvider(
  ({ planId }: { planId: string }) => useOnboardingCheck(planId),
  'useOnboardingContext must be inside OnboardingProvider'
);

export { OnboardingProvider, useOnboardingContext };
