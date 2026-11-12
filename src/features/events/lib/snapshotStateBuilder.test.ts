import { describe, expect, it } from "vitest";
import type { DayPlan } from "@/features/activity/types";
import type { EventInsert } from "@/features/events/types";
import type { Snapshot } from "@/features/snapshots/types";
import { type AppendPreparation, buildSnapshotStateForAppend } from "./snapshotStateBuilder";

const createMockDay = (): DayPlan => ({
  id: "1",
  label: "Day 1",
  position: "d1",
  activities: [],
});

const createMockSnapshot = (overrides: Partial<Snapshot> = {}): Snapshot => ({
  version: 0,
  days: [],
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const activityCreatedEvent: EventInsert = {
  id: "e1",
  planId: "plan-1",
  type: "activity.created",
  payload: {
    dayId: "1",
    activity: {
      id: "a1",
      title: "Test",
      color: "",
      position: "",
      description: "",
      address: "",
      duration: 60,
    },
    position: "a1",
  },
  actorId: "u1",
};

function expectReady(
  result: AppendPreparation
): asserts result is Extract<AppendPreparation, { kind: "ready" }> {
  if (result.kind !== "ready") throw new Error(`expected ready preparation, got ${result.kind}`);
}

describe("snapshotStateBuilder", () => {
  describe("buildSnapshotStateForAppend", () => {
    it("reports empty when the event list is empty", () => {
      const result = buildSnapshotStateForAppend({
        snapshot: createMockSnapshot(),
        baseVersion: 0,
        events: [],
      });

      expect(result).toEqual({ kind: "empty" });
    });

    it("reports conflict when the snapshot version doesn't match baseVersion", () => {
      const result = buildSnapshotStateForAppend({
        snapshot: createMockSnapshot({ version: 5 }),
        baseVersion: 0,
        events: [activityCreatedEvent],
      });

      expect(result).toEqual({ kind: "conflict" });
    });

    it("reports invalid history when rebuilding from an empty history", () => {
      const result = buildSnapshotStateForAppend({
        snapshot: createMockSnapshot({ version: 1, days: [] }),
        baseVersion: 1,
        events: [activityCreatedEvent],
        history: [],
      });

      expect(result).toMatchObject({ kind: "invalid-history" });
    });

    it("reports invalid history when the history is incomplete", () => {
      const result = buildSnapshotStateForAppend({
        snapshot: createMockSnapshot({ version: 2, days: [] }),
        baseVersion: 2,
        events: [activityCreatedEvent],
        history: [
          {
            id: "e1",
            planId: "plan-1",
            version: 1,
            type: "day.created",
            payload: { day: { id: "1", label: "Day 1", position: "d1", activities: [] } },
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        ],
      });

      expect(result).toMatchObject({ kind: "invalid-history", reason: expect.stringContaining("version=1") });
    });

    it("reports ready state when the version matches and events are provided", () => {
      const result = buildSnapshotStateForAppend({
        snapshot: createMockSnapshot({ version: 0, days: [createMockDay()] }),
        baseVersion: 0,
        events: [activityCreatedEvent],
      });

      expectReady(result);
      expect(result.snapshot.days).toHaveLength(1);
      expect(result.snapshot.days[0].activities).toHaveLength(1);
      expect(result.snapshot.days[0].activities[0].id).toBe("a1");
    });
  });
});
