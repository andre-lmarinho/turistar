// src/utils/syncDaysWithTripRange.ts

import type { DayPlan } from '@/types/itinerary';
import { format } from 'date-fns';

/**
 * Sync the days array to match the new trip range.
 * - If reducing days → push extra activities to the last available day.
 * - If increasing days → add empty days.
 *
 * @param currentDays Existing planner days.
 * @param tripDays Array of trip dates.
 */
export function syncDaysWithTripRange(currentDays: DayPlan[], tripDays: Date[]): DayPlan[] {
  const newTripDays = tripDays.length;

  const formatLabel = (date: Date) => format(date, 'EEE, dd MMM');
  if (currentDays.length === newTripDays) {
    // Even if the length is the same, we must relabel days
    return currentDays.map((day, index) => ({
      ...day,
      id: `day-${index + 1}`,
      label: formatLabel(tripDays[index]),
    }));
  }

  const copy = [...currentDays];

  // If reducing days → move overflow activities to the last available day
  if (newTripDays < currentDays.length) {
    // Merge extra days into the last remaining day
    const keptDays = copy.slice(0, newTripDays);
    const overflowDays = copy.slice(newTripDays);

    // Collect all overflow activities
    const overflowActivities = overflowDays.flatMap((day) => day.activities);

    // Push to the last remaining day
    keptDays[keptDays.length - 1].activities.push(...overflowActivities);

    // Relabel all kept days
    return keptDays.map((day, index) => ({
      ...day,
      id: `day-${index + 1}`,
      label: formatLabel(tripDays[index]),
    }));
  } else {
    // If increasing days → add extra empty days
    for (let i = currentDays.length; i < newTripDays; i++) {
      copy.push({
        id: `day-${i + 1}`,
        label: formatLabel(tripDays[i]),
        activities: [],
      });
    }

    // Relabel all days (both original and new)
    return copy.map((day, index) => ({
      ...day,
      id: `day-${index + 1}`,
      label: formatLabel(tripDays[index]),
    }));
  }
}
