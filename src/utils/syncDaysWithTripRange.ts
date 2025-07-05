// src/utils/syncDaysWithTripRange.ts

import type { DayPlan } from '@/types/itinerary';
import { formatDayPlan } from '@/utils/formatDayPlan';

/**
 * Syncs the existing planner with the new trip range.
 *
 * Rules:
 * - If reducing days → push overflow activities to the last remaining day.
 * - If increasing days → add empty days.
 * - Always relabel days to match the current trip dates.
 *
 * @param currentDays Existing planner days.
 * @param tripDays Current trip dates.
 * @returns Updated planner days with synced IDs and labels.
 */
export function syncDaysWithTripRange(currentDays: DayPlan[], tripDays: Date[]): DayPlan[] {
  const newTripDays = tripDays.length;

  // Case 1: Same number of days → just relabel.
  if (currentDays.length === newTripDays) {
    return currentDays.map((day, index) => ({
      ...day,
      ...formatDayPlan(tripDays[index]),
    }));
  }

  const copy = [...currentDays];

  // Case 2: Trip was shortened → move overflow activities to the last remaining day.
  if (newTripDays < currentDays.length) {
    const keptDays = copy.slice(0, newTripDays);
    const overflowDays = copy.slice(newTripDays);

    const overflowActivities = overflowDays.flatMap((day) => day.activities);

    keptDays[keptDays.length - 1].activities.push(...overflowActivities);

    return keptDays.map((day, index) => ({
      ...day,
      ...formatDayPlan(tripDays[index]),
    }));
  } else {
    // Case 3: Trip was extended → add extra empty days.
    for (let i = currentDays.length; i < newTripDays; i++) {
      copy.push({
        ...formatDayPlan(tripDays[i]),
        activities: [],
      });
    }

    return copy.map((day, index) => ({
      ...day,
      ...formatDayPlan(tripDays[index]),
    }));
  }
}
