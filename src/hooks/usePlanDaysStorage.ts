// src/hooks/usePlanDaysStorage.ts
'use client';

import { useLocalStorageSync } from '@/lib';
import type { DayPlan } from '@/types';

/**
 * Persists planner days to localStorage.
 * Reads the stored value on mount and saves on change.
 */
export function usePlanDaysStorage(
  planId: string,
  days: DayPlan[],
  setDays: React.Dispatch<React.SetStateAction<DayPlan[]>>
) {
  const storageKey = `catalog-${planId}`;
  useLocalStorageSync(storageKey, days, setDays);
}
