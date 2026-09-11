import { format, formatISO } from "date-fns";

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
