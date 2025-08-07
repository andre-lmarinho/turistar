// src/features/onboarding/hooks/OnboardingContext.tsx
'use client';

import React, { ReactNode } from 'react';
import { createStrictContext } from '@/shared/context/createStrictContext';
import { useOnboardingCheck } from './useOnboardingCheck';

const [OnboardingContextProvider, useOnboardingContext] = createStrictContext<
  ReturnType<typeof useOnboardingCheck>
>('useOnboardingContext must be inside OnboardingProvider');

export function OnboardingProvider({ planId, children }: { planId: string; children: ReactNode }) {
  const value = useOnboardingCheck(planId);
  return <OnboardingContextProvider value={value}>{children}</OnboardingContextProvider>;
}

export { useOnboardingContext };
