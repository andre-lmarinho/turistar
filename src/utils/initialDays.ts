// src/utils/initialDays.ts
import { formatISO } from 'date-fns';
import type { DayPlan } from '@/types/itinerary';

/**
 * Builds an empty DayPlan array.
 * Pass a list of dates if you already have them; otherwise you’ll get an empty planner.
 */
export function buildInitialDays(tripDays: Date[] = []): DayPlan[] {
  return tripDays.map((d) => ({
    id: formatISO(d, { representation: 'date' }),
    label: d.toLocaleDateString('en-US', {
      weekday: 'short',
      day: '2-digit',
    }),
    activities: [],
  }));
}
