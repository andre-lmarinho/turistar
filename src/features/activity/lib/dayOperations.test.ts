import { describe, expect, it } from "vitest";
import type { DayPlan } from "../types";
import { buildInitialDays, formatDay, syncDaysWithRange } from "./dayOperations";

describe("formatDay", () => {
  it("formats date into DayPlan id and label", () => {
    const date = new Date("2024-01-15T12:00:00");

    const result = formatDay(date);

    expect(result.id).toBe("2024-01-15");
    expect(result.label).toMatch(/Mon, 15 Jan/);
  });
});

describe("buildInitialDays", () => {
  it("creates empty days for each date", () => {
    const dates = [new Date("2024-01-01"), new Date("2024-01-02"), new Date("2024-01-03")];

    const result = buildInitialDays(dates);

    expect(result).toHaveLength(3);
    expect(result[0].id).toBe("2024-01-01");
    expect(result[1].id).toBe("2024-01-02");
    expect(result[2].id).toBe("2024-01-03");
  });

  it("each day has empty activities array", () => {
    const dates = [new Date("2024-01-01")];

    const result = buildInitialDays(dates);

    expect(result[0].activities).toEqual([]);
  });

  it("handles single day", () => {
    const dates = [new Date("2024-03-15")];

    const result = buildInitialDays(dates);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2024-03-15");
  });

  it("handles empty array", () => {
    const result = buildInitialDays([]);

    expect(result).toEqual([]);
  });
});

describe("syncDaysWithRange", () => {
  it("returns empty array when tripDates is empty", () => {
    const currentDays: DayPlan[] = [{ id: "2024-01-01", label: "Day 1", position: "a0", activities: [] }];

    const result = syncDaysWithRange(currentDays, []);

    expect(result).toEqual([]);
  });

  it("updates labels when length matches", () => {
    const currentDays: DayPlan[] = [
      { id: "2024-01-01", label: "Old Label 1", position: "a0", activities: [] },
      { id: "2024-01-02", label: "Old Label 2", position: "a1", activities: [] },
    ];
    const tripDates = [new Date("2024-02-01"), new Date("2024-02-02")];

    const result = syncDaysWithRange(currentDays, tripDates);

    expect(result[0].id).toBe("2024-02-01");
    expect(result[1].id).toBe("2024-02-02");
    expect(result[0].label).not.toBe("Old Label 1");
  });

  it("preserves activities when dates match", () => {
    const currentDays: DayPlan[] = [
      {
        id: "2024-01-01",
        label: "Day 1",
        position: "a0",
        activities: [
          { id: "a1", title: "Activity 1", description: "", color: "blue", duration: 60, category: "" },
        ],
      },
    ];
    const tripDates = [new Date("2024-01-01")];

    const result = syncDaysWithRange(currentDays, tripDates);

    expect(result[0].activities).toHaveLength(1);
    expect(result[0].activities[0].id).toBe("a1");
  });

  it("creates new days with empty activities", () => {
    const currentDays: DayPlan[] = [];
    const tripDates = [new Date("2024-01-01"), new Date("2024-01-02")];

    const result = syncDaysWithRange(currentDays, tripDates);

    expect(result).toHaveLength(2);
    expect(result[0].activities).toEqual([]);
    expect(result[1].activities).toEqual([]);
  });

  it("moves orphaned activities to first day when date removed from beginning", () => {
    const currentDays: DayPlan[] = [
      {
        id: "2023-12-31",
        label: "Old Day",
        position: "a0",
        activities: [
          { id: "a1", title: "Orphaned", description: "", color: "blue", duration: 60, category: "" },
        ],
      },
      {
        id: "2024-01-01",
        label: "Day 1",
        position: "a1",
        activities: [],
      },
    ];
    const tripDates = [new Date("2024-01-01"), new Date("2024-01-02")];

    const result = syncDaysWithRange(currentDays, tripDates);

    expect(result[0].activities).toHaveLength(1);
    expect(result[0].activities[0].id).toBe("a1");
    expect(result[1].activities).toEqual([]);
  });

  it("moves orphaned activities to last day when date removed from end", () => {
    const currentDays: DayPlan[] = [
      {
        id: "2024-01-02",
        label: "Day 2",
        position: "a0",
        activities: [],
      },
      {
        id: "2024-01-03",
        label: "Old Day",
        position: "a1",
        activities: [
          { id: "a1", title: "Orphaned", description: "", color: "blue", duration: 60, category: "" },
        ],
      },
    ];
    const tripDates = [new Date("2024-01-01"), new Date("2024-01-02")];

    const result = syncDaysWithRange(currentDays, tripDates);

    expect(result[0].activities).toEqual([]);
    expect(result[1].activities).toHaveLength(1);
    expect(result[1].activities[0].id).toBe("a1");
  });

  it("handles expansion from 2 to 4 days", () => {
    const currentDays: DayPlan[] = [
      {
        id: "2024-01-01",
        label: "Day 1",
        position: "a0",
        activities: [
          { id: "a1", title: "Activity 1", description: "", color: "blue", duration: 60, category: "" },
        ],
      },
      {
        id: "2024-01-02",
        label: "Day 2",
        position: "a1",
        activities: [
          { id: "a2", title: "Activity 2", description: "", color: "blue", duration: 60, category: "" },
        ],
      },
    ];
    const tripDates = [
      new Date("2024-01-01"),
      new Date("2024-01-02"),
      new Date("2024-01-03"),
      new Date("2024-01-04"),
    ];

    const result = syncDaysWithRange(currentDays, tripDates);

    expect(result).toHaveLength(4);
    expect(result[0].activities).toHaveLength(1);
    expect(result[1].activities).toHaveLength(1);
    expect(result[2].activities).toEqual([]);
    expect(result[3].activities).toEqual([]);
  });

  it("handles contraction from 4 to 2 days", () => {
    const currentDays: DayPlan[] = [
      {
        id: "2024-01-01",
        label: "Day 1",
        position: "a0",
        activities: [
          { id: "a1", title: "Activity 1", description: "", color: "blue", duration: 60, category: "" },
        ],
      },
      {
        id: "2024-01-02",
        label: "Day 2",
        position: "a1",
        activities: [],
      },
      {
        id: "2024-01-03",
        label: "Day 3",
        position: "a2",
        activities: [
          { id: "a2", title: "Activity 2", description: "", color: "blue", duration: 60, category: "" },
        ],
      },
      {
        id: "2024-01-04",
        label: "Day 4",
        position: "a3",
        activities: [],
      },
    ];
    const tripDates = [new Date("2024-01-01"), new Date("2024-01-02")];

    const result = syncDaysWithRange(currentDays, tripDates);

    expect(result).toHaveLength(2);
    expect(result[0].activities).toHaveLength(1);
    expect(result[1].activities).toHaveLength(1);
  });

  it("updates labels for matching dates", () => {
    const currentDays: DayPlan[] = [
      {
        id: "2024-01-01",
        label: "Old Label",
        position: "a0",
        activities: [],
      },
    ];
    const tripDates = [new Date("2024-01-01")];

    const result = syncDaysWithRange(currentDays, tripDates);

    expect(result[0].label).not.toBe("Old Label");
  });
});
