// src/features/planner/services/moveActivityPosition.ts

import type { DayPlan } from '@/shared/types';
import { cloneDays } from '@/features/planner/services/cloneDays';

/**
 * Moves an activity to a new index within its current day.
 * Returns a new days array without mutating the input.
 */
export function moveActivityPosition(
  days: DayPlan[],
  activityId: string,
  newIndex: number
): DayPlan[] {
  const copy = cloneDays(days);

  for (const day of copy) {
    const idx = day.activities.findIndex((a) => a.id === activityId);
    if (idx !== -1) {
      const [moved] = day.activities.splice(idx, 1);
      const target = Math.max(0, Math.min(newIndex, day.activities.length));
      day.activities.splice(target, 0, moved);
      break;
    }
  }

  return copy;
}
