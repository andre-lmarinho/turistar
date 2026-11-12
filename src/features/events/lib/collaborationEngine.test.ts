import { describe, expect, it } from "vitest";

import type { DayPlan } from "@/features/activity/types";
import type { EventInsert, EventRecord, EventState, PlanOperation } from "@/features/events/types";
import {
  acknowledgeEvents,
  buildLocalOperations,
  buildSeedEvents,
  type CollaborationQueue,
  projectPendingDays,
} from "./collaborationEngine";

const day: DayPlan = {
  id: "2026-09-10",
  label: "Day 1",
  position: "1024",
  activities: [{ id: "a1", title: "Breakfast", color: "bg-[var(--color-1)]", position: "1024" }],
};
const confirmed: EventState = { days: [day], version: 1 };

function queue(overrides: Partial<CollaborationQueue> = {}): CollaborationQueue {
  return {
    planId: "p1",
    loaded: true,
    confirmed,
    pending: [],
    received: new Map(),
    ...overrides,
  };
}

function event(
  version: number,
  overrides: Partial<Pick<EventRecord, "id" | "planId" | "version" | "createdAt" | "actorId">> = {}
): EventRecord {
  return {
    id: `remote-${version}`,
    planId: "p1",
    version,
    createdAt: new Date(0).toISOString(),
    type: "activity.updated",
    payload: { activityId: "a1", patch: { description: `note ${version}` } },
    ...overrides,
  };
}

const pendingEdit: EventInsert = {
  id: "local-1",
  planId: "p1",
  type: "activity.updated",
  payload: { activityId: "a1", patch: { title: "Local" } },
};

describe("acknowledgeEvents", () => {
  it("confirms the next version and removes the matching pending edit", () => {
    // The append response/realtime returns the local insert itself, with its server version.
    const acknowledged: EventRecord = { ...pendingEdit, version: 2, createdAt: new Date(0).toISOString() };
    const next = acknowledgeEvents(queue({ pending: [pendingEdit] }), [acknowledged]);

    expect(next.confirmed.version).toBe(2);
    expect(next.pending).toEqual([]);
    expect(next.received.size).toBe(0);
    expect(next.confirmed.days[0].activities[0].title).toBe("Local");
  });

  it("holds an out-of-order event until the gap fills", () => {
    const first = acknowledgeEvents(queue(), [event(3)]);

    expect(first.confirmed.version).toBe(1);
    expect(first.received.get(3)).toBeDefined();

    const second = acknowledgeEvents(first, [event(2)]);

    expect(second.confirmed.version).toBe(3);
    expect(second.received.size).toBe(0);
  });

  it("acknowledges the same event delivered twice exactly once", () => {
    const delivered: EventRecord = { ...pendingEdit, version: 2, createdAt: new Date(0).toISOString() };
    const once = acknowledgeEvents(queue({ pending: [pendingEdit] }), [delivered]);
    const twice = acknowledgeEvents(once, [delivered]);

    expect(twice.confirmed.version).toBe(2);
    expect(twice.pending).toEqual([]);
    expect(twice.received.size).toBe(0);
  });

  it("ignores events from other plans and buffers before the document loads", () => {
    const otherPlan = acknowledgeEvents(queue(), [event(2, { planId: "other" })]);

    expect(otherPlan.confirmed.version).toBe(1);
    expect(otherPlan.received.size).toBe(0);

    const unloaded = acknowledgeEvents(queue({ loaded: false }), [event(2)]);

    expect(unloaded.confirmed.version).toBe(1);
    expect(unloaded.received.get(2)).toBeDefined();
  });

  it("does not confirm behind the current version again", () => {
    const stale = acknowledgeEvents(queue(), [event(1)]);

    expect(stale.confirmed.version).toBe(1);
    expect(stale.received.size).toBe(0);
  });
});

describe("projectPendingDays", () => {
  it("applies pending edits over confirmed days without mutating them", () => {
    const projected = projectPendingDays(confirmed, [pendingEdit]);

    expect(projected[0].activities[0].title).toBe("Local");
    expect(confirmed.days[0].activities[0].title).toBe("Breakfast");
  });
});

describe("buildSeedEvents", () => {
  it("wraps seeded days as day.created inserts with scale positions", () => {
    const seeds = [
      { ...day, activities: [], position: "1024" },
      { id: "2026-09-11", label: "Day 2", activities: [] },
    ];

    const events = buildSeedEvents(seeds, "p1", "actor-1");

    expect(events.map(({ type, planId, actorId }) => ({ type, planId, actorId }))).toEqual([
      { type: "day.created", planId: "p1", actorId: "actor-1" },
      { type: "day.created", planId: "p1", actorId: "actor-1" },
    ]);
    expect(events.map((item) => item.payload.day.position)).toEqual(["1024", String(2 * 1024)]);
    expect(new Set(events.map(({ id }) => id)).size).toBe(2);
  });
});

describe("buildLocalOperations", () => {
  it("wraps operations as inserts with unique ids", () => {
    const operations: PlanOperation[] = [
      { type: "activity.updated", payload: { activityId: "a1", patch: {} } },
    ];

    const inserts = buildLocalOperations(operations, "p1", "actor-1");

    expect(inserts[0]).toMatchObject({ planId: "p1", actorId: "actor-1", type: "activity.updated" });
    expect(inserts[0].id).toBeTruthy();
  });
});
