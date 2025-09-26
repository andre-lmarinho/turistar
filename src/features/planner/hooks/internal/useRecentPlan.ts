// src/features/planner/hooks/internal/useRecentPlan.ts
'use client';

import { useLocalStorage } from '@/shared/hooks/useLocalStorage';

export interface RecentPlan {
  id: string;
  slug: string;
  dest: string;
  start: string;
  end: string;
}

/**
 * Persists metadata for the most recently created plan.
 */
export function useRecentPlan() {
  const [recentPlan, setRecentPlan] = useLocalStorage<RecentPlan | null>('recent_plan', null);

  const saveRecentPlan = (plan: RecentPlan) => {
    setRecentPlan(plan);
  };

  return { recentPlan, saveRecentPlan } as const;
}
