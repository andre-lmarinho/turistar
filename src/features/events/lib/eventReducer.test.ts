import { describe, expect, it } from "vitest";

import type { DayPlan } from "@/features/activity/types";

import { applyEvent, reduceEvents } from "../lib/eventReducer";
import type { EventRecord, PlanOperation } from "../types";

const baseDay: DayPlan = {
  id: "day-1",
  label: "Day 1",
  position: "1024",
  activities: [
    { id: "a-1", title: "Breakfast", color: "bg-red", position: "1024" },
    { id: "a-3", title: "Dinner", color: "bg-blue", position: "3072" },
  ],
};

describe("eventReducer", () => {
  it("inserts created activities at the correct ordered position", () => {
    const createdEvent: EventRecord = {
      id: "evt-1",
      planId: "plan-1",
      version: 2,
      type: "activity.created",
      createdAt: new Date().toISOString(),
      payload: {
        dayId: "day-1",
        position: "2048",
        activity: {
          id: "a-2",
          title: "Lunch",
          color: "bg-green",
          position: "2048",
        },
      },
    };

    const result = applyEvent([baseDay], createdEvent);

    expect(result[0]?.activities.map((activity) => activity.id)).toEqual(["a-1", "a-2", "a-3"]);
  });

  it("inserts created days using numeric ordering", () => {
    const existingDays: DayPlan[] = [
      { id: "day-early", label: "Arrival", position: "512", activities: [] },
      { id: "day-late", label: "Departure", position: "2048", activities: [] },
    ];

    const createdDayEvent: EventRecord = {
      id: "evt-2",
      planId: "plan-1",
      version: 3,
      type: "day.created",
      createdAt: new Date().toISOString(),
      payload: {
        day: {
          id: "day-mid",
          label: "City tour",
          position: "1024",
          activities: [],
        },
      },
    };

    const result = applyEvent(existingDays, createdDayEvent);

    expect(result.map((day) => day.id)).toEqual(["day-early", "day-mid", "day-late"]);
  });

  it("reorders days numerically when positions have different digit lengths", () => {
    const existingDays: DayPlan[] = [
      { id: "day-a", label: "Arrival", position: "512", activities: [] },
      { id: "day-b", label: "Exploration", position: "1024", activities: [] },
      { id: "day-c", label: "Departure", position: "2048", activities: [] },
    ];

    const reorderEvent: EventRecord = {
      id: "evt-3",
      planId: "plan-1",
      version: 4,
      type: "day.reordered",
      createdAt: new Date().toISOString(),
      payload: {
        dayId: "day-b",
        position: "64",
      },
    };

    const result = applyEvent(existingDays, reorderEvent);

    expect(result.map((day) => day.id)).toEqual(["day-b", "day-a", "day-c"]);
  });
});

it("replays the same transitions locally and from history without mutating the input", () => {
  const original = structuredClone(baseDay);
  const operations: PlanOperation[] = [
    {
      type: "day.created",
      payload: { day: { id: "day-2", label: "Day 2", position: "2048", activities: [] } },
    },
    { type: "activity.updated", payload: { activityId: "a-1", patch: { description: "Local note" } } },
    {
      type: "activity.moved",
      payload: { activityId: "a-1", fromDayId: "day-1", toDayId: "day-2", position: "1024" },
    },
    // A concurrent move has made the recorded source stale.
    {
      type: "activity.moved",
      payload: { activityId: "a-1", fromDayId: "day-1", toDayId: "day-1", position: "4096" },
    },
    { type: "activity.deleted", payload: { activityId: "a-3" } },
  ];
  const local = operations.reduce(applyEvent, [baseDay]);
  const history = operations.map(
    (operation, index): EventRecord => ({
      ...operation,
      id: `e${index}`,
      planId: "p1",
      version: index + 1,
      createdAt: new Date(0).toISOString(),
    })
  );
  const confirmed = reduceEvents(
    { days: [baseDay], version: 0, updatedAt: new Date(0).toISOString() },
    history
  );
  expect(confirmed.days).toEqual(local);
  expect(local[0].activities).toHaveLength(1);
  expect(local[0].activities[0]).toMatchObject({ id: "a-1", description: "Local note" });
  expect(local[1].activities).toEqual([]);
  expect(baseDay).toEqual(original);
});

it("clears coordinates through JSON-safe patches without erasing unrelated fields", () => {
  const located = { ...baseDay, activities: [{ ...baseDay.activities[0], latitude: 12, longitude: 34 }] };
  const operation: PlanOperation = {
    type: "activity.updated",
    payload: { activityId: "a-1", patch: { address: "New address", latitude: null, longitude: null } },
  };
  const serialized: PlanOperation = JSON.parse(JSON.stringify(operation));
  const updated = applyEvent([located], serialized)[0].activities[0];
  expect(updated.latitude).toBeUndefined();
  expect(updated.longitude).toBeUndefined();
  expect(updated.title).toBe("Breakfast");
  expect(updated.address).toBe("New address");
});

it("does not recreate an activity or remove it from its source when a move target is missing", () => {
  const operation: PlanOperation = {
    type: "activity.moved",
    payload: { activityId: "a-1", fromDayId: "day-1", toDayId: "deleted-day", position: "1024" },
  };
  expect(applyEvent([baseDay], operation)).toEqual([baseDay]);
  expect(applyEvent([], operation)).toEqual([]);
});
