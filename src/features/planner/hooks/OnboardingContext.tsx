'use client';

import { createContextProvider } from '@/shared/lib/createContextProvider';
import { useOnboardingCheck } from './modules/useOnboardingCheck';

export const [OnboardingProvider, useOnboardingContext] = createContextProvider(
  ({ planId }: { planId: string }) => useOnboardingCheck(planId),
  'useOnboardingContext must be inside OnboardingProvider'
);
