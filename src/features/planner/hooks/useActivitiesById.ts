import { useMemo } from 'react';
import type { DayPlan, Activity } from '@/features/planner/domain/types/PlannerEntities';

/**
 * Creates a lookup table for all activities by their ID.
 * Improves performance over flatMap().find() in large boards.
 */

export function useActivitiesById(days: DayPlan[]) {
  return useMemo(() => {
    const map: Record<string, Activity & { dayId: string }> = {};

    for (const day of days) {
      for (const activity of day.activities) {
        map[activity.id] = { ...activity, dayId: day.id };
      }
    }

    return map;
  }, [days]);
}
