'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from '@/shared/hooks/useLocalStorage';

/**
 * Handles onboarding dialog visibility based on localStorage.
 * Shows the dialog once per plan ID and persists the flag.
 */
export function useOnboardingCheck(planId: string) {
  const key = `planner-onboarding-shown-${planId}`;
  const [seen, setSeen, ready] = useLocalStorage<boolean>(key, false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const initialized = useRef(false);
  const prevKey = useRef(key);

  useEffect(() => {
    if (prevKey.current !== key) {
      initialized.current = false;
      prevKey.current = key;
    }
    if (!ready || initialized.current) return;
    if (!seen) {
      setShowOnboarding(true);
      setSeen(true);
    } else {
      setShowOnboarding(false);
    }
    initialized.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, seen, key]);

  return { showOnboarding, setShowOnboarding };
}
