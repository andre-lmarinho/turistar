// src/features/planner/services/cloneDays.ts

import type { DayPlan } from '@/shared/types';

/**
 * Creates a shallow copy of each day and its activities array.
 * This avoids mutating the original days structure when reordering
 * or moving activities between days.
 */
export function cloneDays(days: DayPlan[]): DayPlan[] {
  return days.map((day) => ({ ...day, activities: [...day.activities] }));
}
