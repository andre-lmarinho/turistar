import { formatDayPlan } from '@/features/app/planner/domain/days/formatDayPlan';
import type { DayPlan } from '@/features/app/planner/domain/types/PlannerEntities';

/**
 * Builds an initial empty DayPlan array.
 * Each day has a unique ISO id and a readable label (e.g., "Mon 05").
 *
 * @param tripDays Array of Date objects representing each trip day.
 * @returns DayPlan[] with empty activities per day.
 */
export function buildInitialDays(tripDays: Date[] = []): DayPlan[] {
  return tripDays.map((d) => ({
    ...formatDayPlan(d),
    activities: [],
  }));
}
