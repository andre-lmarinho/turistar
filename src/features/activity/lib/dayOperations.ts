import { format, formatISO, isAfter, isBefore, parseISO } from "date-fns";

import type { DayPlan } from "../types";

/**
 * Format a date into DayPlan id and label.
 */
export function formatDay(date: Date): Pick<DayPlan, "id" | "label"> {
  return {
    id: formatISO(date, { representation: "date" }),
    label: format(date, "EEE, dd MMM"),
  };
}

/**
 * Build initial empty days from trip dates.
 */
export function buildInitialDays(tripDates: Date[]): DayPlan[] {
  return tripDates.map((date) => ({
    ...formatDay(date),
    activities: [],
  }));
}

/**
 * Sync existing days with a new trip date range.
 * - Preserves activities when days overlap
 * - Moves orphaned activities to first/last day
 * - Updates labels to match new dates
 */
export function syncDaysWithRange(currentDays: DayPlan[], tripDates: Date[]): DayPlan[] {
  if (tripDates.length === 0) return [];

  // Same length: just update ids and labels
  if (currentDays.length === tripDates.length) {
    return currentDays.map((day, i) => ({
      ...day,
      ...formatDay(tripDates[i]),
    }));
  }

  const formatted = tripDates.map(formatDay);
  const tripIds = new Set(formatted.map((d) => d.id));
  const existingMap = new Map(currentDays.map((d) => [d.id, d]));

  // Build new days, preserving activities where dates match
  const updated: DayPlan[] = formatted.map((template) => {
    const existing = existingMap.get(template.id);
    return existing ? { ...existing, label: template.label } : { ...template, activities: [] };
  });

  // Collect orphaned activities
  const firstDate = tripDates[0];
  const lastDate = tripDates[tripDates.length - 1];
  const beforeActivities: DayPlan["activities"] = [];
  const afterActivities: DayPlan["activities"] = [];

  for (const day of currentDays) {
    if (tripIds.has(day.id)) continue;
    const date = parseISO(day.id);
    if (isBefore(date, firstDate)) {
      beforeActivities.push(...day.activities);
    } else if (isAfter(date, lastDate)) {
      afterActivities.push(...day.activities);
    }
  }

  // Append orphaned activities to first/last day
  if (beforeActivities.length > 0) {
    updated[0] = {
      ...updated[0],
      activities: [...beforeActivities, ...updated[0].activities],
    };
  }
  if (afterActivities.length > 0) {
    const lastIdx = updated.length - 1;
    updated[lastIdx] = {
      ...updated[lastIdx],
      activities: [...updated[lastIdx].activities, ...afterActivities],
    };
  }

  return updated;
}
