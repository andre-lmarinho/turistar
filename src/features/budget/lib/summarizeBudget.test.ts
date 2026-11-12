import { describe, expect, it } from "vitest";

import type { DayPlan } from "@/features/activity/types";

import type { Entry } from "../types";
import { summarizeBudget } from "./summarizeBudget";

const days: DayPlan[] = [
  {
    id: "day-1",
    label: "Day 1",
    activities: [
      { id: "activity-1", title: "Museum", color: "bg-[var(--color-1)]", budget: 40 },
      { id: "activity-2", title: "Park", color: "bg-[var(--color-2)]" },
    ],
  },
];

const entries: Entry[] = [
  { id: "entry-1", description: "Taxi", category: "transport", amount: 20 },
  { id: "entry-2", description: "Tour", category: "activities", amount: 15 },
  { id: "entry-3", description: "Dinner", category: "food", amount: 30 },
];

describe("summarizeBudget", () => {
  it("combines activity budgets and manual entries by category", () => {
    expect(summarizeBudget(days, entries)).toEqual({
      categoryTotals: {
        transport: 20,
        lodging: 0,
        food: 30,
        activities: 55,
        shopping: 0,
        documents: 0,
      },
      totalSpent: 105,
    });
  });

  it("returns zero totals for an empty plan", () => {
    expect(summarizeBudget([], [])).toEqual({
      categoryTotals: {
        transport: 0,
        lodging: 0,
        food: 0,
        activities: 0,
        shopping: 0,
        documents: 0,
      },
      totalSpent: 0,
    });
  });
});
