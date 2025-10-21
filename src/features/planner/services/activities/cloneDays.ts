import type { DayPlan } from '@/features/planner/domain/types/PlannerEntities';

/**
 * Creates a deep copy of each day with cloned activity entries so that callers
 * can safely mutate nested activity properties without affecting the original
 * references.
 */
export function cloneDays(days: DayPlan[]): DayPlan[] {
  return days.map((day) => ({
    ...day,
    activities: day.activities.map((activity) => ({ ...activity })),
  }));
}
