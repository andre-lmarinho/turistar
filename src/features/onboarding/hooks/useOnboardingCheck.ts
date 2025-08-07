// src/features/onboarding/hooks/useOnboardingCheck.ts
'use client';

import { useState, useEffect } from 'react';

/**
 * Handles onboarding modal visibility based on localStorage.
 * Shows the modal once per plan ID and persists the flag.
 */
export function useOnboardingCheck(planId: string) {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const key = `planner-onboarding-shown-${planId}`;
    if (!localStorage.getItem(key)) {
      setShowOnboarding(true);
      localStorage.setItem(key, 'true');
    }
  }, [planId]);

  return { showOnboarding, setShowOnboarding };
}
