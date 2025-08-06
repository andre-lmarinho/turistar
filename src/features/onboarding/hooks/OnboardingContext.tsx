// src/contexts/OnboardingContext.tsx
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useOnboardingCheck } from '@/hooks';

export const OnboardingContext = createContext<ReturnType<typeof useOnboardingCheck> | null>(null);

export function OnboardingProvider({ planId, children }: { planId: string; children: ReactNode }) {
  const value = useOnboardingCheck(planId);
  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboardingContext() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboardingContext must be inside OnboardingProvider');
  return ctx;
}
