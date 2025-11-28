import type { DayPlan } from '@/features/app/planner/domain/types/PlannerEntities';
import { isPlaceholderActivity } from '@/features/app/planner/domain/utils/activityPlaceholders';
import { cloneDays } from './cloneDays';

export function removeBlankActivities(days: DayPlan[]): DayPlan[] {
  return days.map((day) => {
    const filtered = day.activities.filter((activity) => {
      if (isPlaceholderActivity(activity)) return false;
      if ((activity as { _optimistic?: boolean })._optimistic) return false;
      return true;
    });

    return filtered.length === day.activities.length ? day : { ...day, activities: filtered };
  });
}

export function snapshotDays(days: DayPlan[]): { state: DayPlan[]; serialized: string } {
  const state = cloneDays(removeBlankActivities(days));
  return { state, serialized: JSON.stringify(state) };
}
