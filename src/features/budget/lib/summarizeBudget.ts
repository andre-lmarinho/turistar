import type { DayPlan } from "@/features/activity/types";

import type { CategoryKey, Entry } from "../types";

export function summarizeBudget(days: DayPlan[], entries: Entry[]) {
  const categoryTotals: Record<CategoryKey, number> = {
    transport: 0,
    lodging: 0,
    food: 0,
    activities: 0,
    shopping: 0,
    documents: 0,
  };

  for (const day of days) {
    for (const activity of day.activities) categoryTotals.activities += activity.budget ?? 0;
  }
  for (const entry of entries) categoryTotals[entry.category] += entry.amount;

  return {
    categoryTotals,
    totalSpent: Object.values(categoryTotals).reduce((sum, value) => sum + value, 0),
  };
}
