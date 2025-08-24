// src/features/onboarding/hooks/useOnboardingCheck.ts
'use client';

import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/shared/hooks/useLocalStorage';

/**
 * Handles onboarding modal visibility based on localStorage.
 * Shows the modal once per plan ID and persists the flag.
 */
export function useOnboardingCheck(planId: string) {
  const key = `planner-onboarding-shown-${planId}`;
  const [seen, setSeen] = useLocalStorage<boolean>(key, false);
  const [showOnboarding, setShowOnboarding] = useState(!seen);

  useEffect(() => {
    setShowOnboarding(!seen);
    if (!seen) setSeen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId]);

  return { showOnboarding, setShowOnboarding };
}
