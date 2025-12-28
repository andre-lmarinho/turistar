import type { DayPlan } from '@/features/app/planner/domain/types/PlannerEntities';
import { formatDayPlan } from '@/features/app/planner/domain/days/formatDayPlan';
import { parseISO, isBefore, isAfter } from 'date-fns';

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
  if (tripDays.length === 0) return [];

  if (currentDays.length === tripDays.length) {
    return currentDays.map((day, i) => ({ ...day, ...formatDayPlan(tripDays[i]) }));
  }

  const formattedTrip = tripDays.map((d) => formatDayPlan(d));
  const tripIdSet = new Set(formattedTrip.map((t) => t.id));
  const map = new Map(currentDays.map((d) => [d.id, d]));

  const updated: DayPlan[] = formattedTrip.map((tpl) => {
    const existing = map.get(tpl.id);
    return existing ? { ...existing, label: tpl.label } : { ...tpl, activities: [] };
  });

  const first = tripDays[0];
  const last = tripDays[tripDays.length - 1];
  const beforeActs: DayPlan['activities'] = [];
  const afterActs: DayPlan['activities'] = [];

  currentDays.forEach((day) => {
    if (tripIdSet.has(day.id)) return;
    const date = parseISO(day.id);
    if (isBefore(date, first)) {
      beforeActs.push(...day.activities);
    } else if (isAfter(date, last)) {
      afterActs.push(...day.activities);
    }
  });

  if (beforeActs.length) {
    updated[0] = { ...updated[0], activities: [...beforeActs, ...updated[0].activities] };
  }
  if (afterActs.length) {
    const lastIdx = updated.length - 1;
    updated[lastIdx] = {
      ...updated[lastIdx],
      activities: [...updated[lastIdx].activities, ...afterActs],
    };
  }

  return updated;
}
