import { describe, expect, it } from "vitest";
import type { DayPlan } from "@/features/activity/types";
import { applyEvent } from "./eventReducer";
import { changeDateRangeOperations, moveActivityOperation } from "./planOperations";

const days: DayPlan[] = [
  {
    id: "2025-01-10",
    label: "First",
    position: "1024",
    activities: [
      { id: "a", title: "A", color: "blue", position: "1024" },
      { id: "b", title: "B", color: "blue", position: "2048" },
    ],
  },
  {
    id: "2025-01-11",
    label: "Second",
    position: "2048",
    activities: [{ id: "c", title: "C", color: "blue", position: "1024" }],
  },
];

describe("plan intentions", () => {
  it("moves within and across days through the reducer without mutating the source", () => {
    const reordered = moveActivityOperation(days, "a", { toDayId: days[0].id }).reduce(applyEvent, days);
    expect(reordered[0].activities.map((a) => a.id)).toEqual(["b", "a"]);
    const moved = moveActivityOperation(reordered, "a", {
      toDayId: days[1].id,
      beforeActivityId: "c",
    }).reduce(applyEvent, reordered);
    expect(moved[1].activities.map((a) => a.id)).toEqual(["a", "c"]);
    expect(days[0].activities.map((a) => a.id)).toEqual(["a", "b"]);
  });
  it("ignores deleted activity and destination", () => {
    expect(moveActivityOperation(days, "missing", { toDayId: days[0].id })).toEqual([]);
    expect(moveActivityOperation(days, "a", { toDayId: "missing" })).toEqual([]);
  });
  it("shifts overlapping equal-length ranges while keeping the itinerary by trip-day", () => {
    const shifted = changeDateRangeOperations(days, [new Date(2025, 0, 11), new Date(2025, 0, 12)]).reduce(
      applyEvent,
      days
    );
    expect(shifted.map((day) => [day.id, day.activities.map((a) => a.id)])).toEqual([
      ["2025-01-11", ["a", "b"]],
      ["2025-01-12", ["c"]],
    ]);
  });
  it("shrinks ranges without losing activities from removed days", () => {
    const resized = changeDateRangeOperations(days, [new Date(2025, 0, 11)]).reduce(applyEvent, days);
    expect(resized[0].activities.map((a) => a.id)).toEqual(["a", "b", "c"]);
  });
});

describe("date range transitions", () => {
  it("ignores an empty date selection", () => {
    const currentDays: DayPlan[] = [{ id: "2024-01-01", label: "Day 1", position: "a0", activities: [] }];

    const result = changeDateRangeOperations(currentDays, []).reduce(applyEvent, currentDays);

    expect(result).toEqual(currentDays);
  });

  it("updates labels when length matches", () => {
    const currentDays: DayPlan[] = [
      { id: "2024-01-01", label: "Old Label 1", position: "a0", activities: [] },
      { id: "2024-01-02", label: "Old Label 2", position: "a1", activities: [] },
    ];
    const tripDates = [new Date("2024-02-01"), new Date("2024-02-02")];

    const result = changeDateRangeOperations(currentDays, tripDates).reduce(applyEvent, currentDays);

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

    const result = changeDateRangeOperations(currentDays, tripDates).reduce(applyEvent, currentDays);

    expect(result[0].activities).toHaveLength(1);
    expect(result[0].activities[0].id).toBe("a1");
  });

  it("creates new days with empty activities", () => {
    const currentDays: DayPlan[] = [];
    const tripDates = [new Date("2024-01-01"), new Date("2024-01-02")];

    const result = changeDateRangeOperations(currentDays, tripDates).reduce(applyEvent, currentDays);

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

    const result = changeDateRangeOperations(currentDays, tripDates).reduce(applyEvent, currentDays);

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

    const result = changeDateRangeOperations(currentDays, tripDates).reduce(applyEvent, currentDays);

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

    const result = changeDateRangeOperations(currentDays, tripDates).reduce(applyEvent, currentDays);

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

    const result = changeDateRangeOperations(currentDays, tripDates).reduce(applyEvent, currentDays);

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

    const result = changeDateRangeOperations(currentDays, tripDates).reduce(applyEvent, currentDays);

    expect(result[0].label).not.toBe("Old Label");
  });
});
