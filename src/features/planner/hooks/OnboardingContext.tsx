'use client';

import { createContextProvider } from '@/shared/lib/createContextProvider';
import { useOnboardingCheck } from './onboarding/useOnboardingCheck';

export const [OnboardingProvider, useOnboardingContext] = createContextProvider(
  ({ planId }: { planId: string }) => useOnboardingCheck(planId),
  'useOnboardingContext must be inside OnboardingProvider'
);
