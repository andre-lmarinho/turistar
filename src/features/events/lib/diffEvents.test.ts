import { describe, expect, it } from "vitest";

import type { DayPlan } from "@/features/activity/types";

import { diffEvents } from "../lib/diffEvents";
import { reduceEvents } from "../lib/eventReducer";
import type {
  ActivityCreatedPayload,
  ActivityUpdatedPayload,
  DayCreatedPayload,
  EventRecord,
} from "../types";

const baseDay = {
  label: "Day",
};

describe("diffEvents", () => {
  it("emits a single move when dragging an activity past neighbours with stale positions", () => {
    const previousDays = [
      {
        id: "day-1",
        ...baseDay,
        position: "1000",
        activities: [
          { id: "activity-a", title: "A", color: "red", position: "1000" },
          { id: "activity-b", title: "B", color: "red", position: "2000" },
          { id: "activity-c", title: "C", color: "red", position: "3000" },
        ],
      },
    ];

    const nextDays = [
      {
        id: "day-1",
        ...baseDay,
        position: "1000",
        activities: [
          { id: "activity-b", title: "B", color: "red", position: "2000" },
          { id: "activity-c", title: "C", color: "red", position: "3000" },
          { id: "activity-a", title: "A", color: "red", position: "1000" },
        ],
      },
    ];

    const events = diffEvents("plan-1", previousDays, nextDays);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      type: "activity.moved",
      payload: {
        activityId: "activity-a",
        fromDayId: "day-1",
        toDayId: "day-1",
      },
    });
  });

  it("emits only a move when transferring an activity between days", () => {
    const previousDays = [
      {
        id: "day-1",
        ...baseDay,
        position: "1000",
        activities: [{ id: "activity-a", title: "A", color: "red", position: "1000" }],
      },
      {
        id: "day-2",
        ...baseDay,
        position: "2000",
        activities: [{ id: "activity-b", title: "B", color: "red", position: "2000" }],
      },
    ];

    const nextDays = [
      {
        id: "day-1",
        ...baseDay,
        position: "1000",
        activities: [],
      },
      {
        id: "day-2",
        ...baseDay,
        position: "2000",
        activities: [
          { id: "activity-b", title: "B", color: "red" },
          { id: "activity-a", title: "A", color: "red" },
        ],
      },
    ];

    const events = diffEvents("plan-1", previousDays, nextDays);

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      type: "activity.moved",
      payload: {
        activityId: "activity-a",
        fromDayId: "day-1",
        toDayId: "day-2",
      },
    });
  });

  it("moves activities before removing shortened range days", () => {
    const previousDays: DayPlan[] = [
      { id: "2024-01-01", label: "Day 1", position: "1000", activities: [] },
      { id: "2024-01-02", label: "Day 2", position: "2000", activities: [] },
      { id: "2024-01-03", label: "Day 3", position: "3000", activities: [] },
      { id: "2024-01-04", label: "Day 4", position: "4000", activities: [] },
      {
        id: "2024-01-05",
        label: "Day 5",
        position: "5000",
        activities: [{ id: "activity-a", title: "A", color: "red", position: "1000" }],
      },
    ];
    const nextDays: DayPlan[] = [
      { id: "2024-01-01", label: "Day 1", position: "1000", activities: [] },
      { id: "2024-01-02", label: "Day 2", position: "2000", activities: [] },
      { id: "2024-01-03", label: "Day 3", position: "3000", activities: [] },
      {
        id: "2024-01-04",
        label: "Day 4",
        position: "4000",
        activities: [{ id: "activity-a", title: "A", color: "red", position: "1000" }],
      },
    ];

    const events = diffEvents("plan-1", previousDays, nextDays);
    const eventTypes = events.map((event) => event.type);

    expect(eventTypes).toEqual(["activity.moved", "day.removed"]);

    const records: EventRecord[] = events.map((event, index) => ({
      ...event,
      version: index + 1,
      createdAt: new Date(0).toISOString(),
    }));
    const result = reduceEvents(
      { version: 0, days: previousDays, updatedAt: new Date(0).toISOString() },
      records
    );

    expect(result.days).toHaveLength(4);
    expect(result.days.at(-1)?.activities.map((activity) => activity.id)).toEqual(["activity-a"]);
  });

  it("ignores placeholder activities that leak into the next state", () => {
    const previousDays: DayPlan[] = [{ id: "day-1", ...baseDay, position: "1000", activities: [] }];
    const nextDays: DayPlan[] = [
      {
        id: "day-1",
        ...baseDay,
        position: "1000",
        activities: [{ id: "blank-123", title: "", color: "red", position: undefined }],
      },
    ];

    const events = diffEvents("plan-1", previousDays, nextDays);

    expect(events).toHaveLength(0);
  });

  it("omits non-finite coordinates from emitted activities", () => {
    const previousDays: DayPlan[] = [];
    const nextDays: DayPlan[] = [
      {
        id: "day-1",
        ...baseDay,
        position: "1000",
        activities: [
          {
            id: "activity-a",
            title: "A",
            color: "red",
            latitude: Number.POSITIVE_INFINITY,
            longitude: Number.NEGATIVE_INFINITY,
          },
        ],
      },
    ];

    const events = diffEvents("plan-1", previousDays, nextDays);

    const createdDay = events.find((event) => event.type === "day.created");
    expect(createdDay).toBeDefined();
    if (!createdDay || createdDay.type !== "day.created") {
      throw new Error("Expected to find a day.created event");
    }

    const dayPayload = createdDay.payload as DayCreatedPayload;
    const activityFromDay = dayPayload.day.activities[0];
    expect(activityFromDay).toBeDefined();
    expect(activityFromDay).not.toHaveProperty("latitude");
    expect(activityFromDay).not.toHaveProperty("longitude");

    const activityCreated = events.find((event) => event.type === "activity.created");
    expect(activityCreated).toBeDefined();
    if (!activityCreated || activityCreated.type !== "activity.created") {
      throw new Error("Expected to find an activity.created event");
    }

    const createdPayload = activityCreated.payload as ActivityCreatedPayload;
    expect(createdPayload.activity).not.toHaveProperty("latitude");
    expect(createdPayload.activity).not.toHaveProperty("longitude");
  });

  it("drops non-finite coordinates from update patches", () => {
    const previousDays: DayPlan[] = [
      {
        id: "day-1",
        ...baseDay,
        position: "1000",
        activities: [
          {
            id: "activity-a",
            title: "A",
            color: "red",
            position: "1000",
            latitude: 10,
            longitude: 10,
          },
        ],
      },
    ];

    const nextDays: DayPlan[] = [
      {
        id: "day-1",
        ...baseDay,
        position: "1000",
        activities: [
          {
            id: "activity-a",
            title: "A",
            color: "red",
            position: "1000",
            latitude: Number.NaN,
            longitude: Number.POSITIVE_INFINITY,
          },
        ],
      },
    ];

    const events = diffEvents("plan-1", previousDays, nextDays);

    const updateEvent = events.find((event) => event.type === "activity.updated");
    expect(updateEvent).toBeDefined();
    if (!updateEvent || updateEvent.type !== "activity.updated") {
      throw new Error("Expected to find an activity.updated event");
    }

    const updatePayload = updateEvent.payload as ActivityUpdatedPayload;
    expect(updatePayload.patch).not.toHaveProperty("latitude");
    expect(updatePayload.patch).not.toHaveProperty("longitude");
  });
});
