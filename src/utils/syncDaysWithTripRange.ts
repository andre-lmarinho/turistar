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

  // Clone deeply so the original days remain untouched
  const daysCopy = currentDays.map((day) => ({
    ...day,
    activities: [...day.activities],
  }));

  // Case 1: Same number of days → just relabel.
  if (daysCopy.length === newTripDays) {
    return daysCopy.map((day, index) => ({
      ...day,
      ...formatDayPlan(tripDays[index]),
    }));
  }

  // Case 2: Trip was shortened → move overflow activities to the last remaining day.
  if (newTripDays < daysCopy.length) {
    const keptDays = daysCopy.slice(0, newTripDays);
    const overflowDays = daysCopy.slice(newTripDays);

    const overflowActivities = overflowDays.flatMap((day) => day.activities);

    const lastDay = keptDays[keptDays.length - 1];
    keptDays[keptDays.length - 1] = {
      ...lastDay,
      activities: [...lastDay.activities, ...overflowActivities],
    };

    return keptDays.map((day, index) => ({
      ...day,
      ...formatDayPlan(tripDays[index]),
    }));
  }

  // Case 3: Trip was extended → add extra empty days.
  for (let i = daysCopy.length; i < newTripDays; i++) {
    daysCopy.push({
      ...formatDayPlan(tripDays[i]),
      activities: [],
    });
  }

  return daysCopy.map((day, index) => ({
    ...day,
    ...formatDayPlan(tripDays[index]),
  }));
}
