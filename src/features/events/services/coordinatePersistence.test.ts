import { buildRpcMock, buildTableMock } from "@tests/utils/mocks";
import { describe, expect, it } from "vitest";

import type { Activity } from "@/features/activity/types";
import { reduceEvents } from "@/features/events/lib/eventReducer";
import { EventsRepository } from "@/features/events/repositories/EventsRepository";
import type { EventInsert } from "@/features/events/types";
import type { SnapshotRow } from "@/features/snapshots/repositories/SnapshotsRepository";
import { SnapshotsRepository } from "@/features/snapshots/repositories/SnapshotsRepository";
import { SnapshotsService } from "@/features/snapshots/services/SnapshotsService";
import type { Json } from "@/supabase/types";
import { appendEventsSchema } from "@/trpc/server/routers/viewer/events/append.schema";

import { EventsService } from "./EventsService";

const planId = "plan-1";
const activity = {
  id: "activity-1",
  title: "Museum",
  color: "blue",
  description: "Keep these notes",
  latitude: 0,
  longitude: -43.2,
  position: "1024",
} satisfies Activity;
const snapshotRow = {
  plan_id: planId,
  version: 1,
  state: { days: [{ id: "day-1", label: "Day 1", position: "1024", activities: [activity] }] },
  updated_at: "2026-01-01T00:00:00.000Z",
};

function createPersistence() {
  const { supabase, chain } = buildTableMock<SnapshotRow>("plan_snapshots", {
    data: snapshotRow,
    error: null,
  });
  const { rpc } = buildRpcMock<unknown>("append_plan_events", { data: null, error: null });
  Object.assign(supabase, { rpc });
  const snapshots = new SnapshotsService(new SnapshotsRepository(supabase));
  const service = new EventsService(new EventsRepository(supabase), snapshots);
  return { supabase, rpc, chain, snapshots, service };
}

function update(patch: { latitude?: number | null; longitude?: number | null; title?: string }): EventInsert {
  return { id: "event-2", planId, type: "activity.updated", payload: { activityId: activity.id, patch } };
}

describe("coordinate persistence", () => {
  it.each([
    { latitude: null, longitude: null },
    { latitude: null },
    { longitude: null },
    { title: "New title" },
    { latitude: 0, longitude: 0 },
  ])("preserves clearing, omission and zero through JSON, append, snapshot and replay: %j", async (patch) => {
    const { rpc, chain, snapshots, service } = createPersistence();
    const before = await snapshots.fetchSnapshot(planId);
    const input = appendEventsSchema.parse(
      JSON.parse(JSON.stringify({ planId, baseVersion: 1, events: [update(patch)] }))
    );
    let persistedState: Json = null;
    // The database transport is the only fake: production validation, reducer and repositories run.
    rpc.mockImplementation(async (_name, args) => {
      const wire = JSON.parse(JSON.stringify(args)) as {
        events: EventInsert[];
        snapshot_state: Json;
      };
      persistedState = wire.snapshot_state;
      const inserted = wire.events.map((event) => ({
        event_id: event.id,
        plan_id: event.planId,
        version: 2,
        event_type: event.type,
        payload: event.payload,
        created_at: snapshotRow.updated_at,
        actor_id: null,
      }));
      return { data: { version: 2, inserted_events: inserted }, error: null };
    });

    const appended = await service.appendEvents(input.planId, input.baseVersion, input.events);
    expect(rpc).toHaveBeenCalledWith(
      "append_plan_events",
      expect.objectContaining({
        plan_id: planId,
        base_version: 1,
        events: input.events,
      })
    );
    const saved = { ...snapshotRow, version: appended.version, state: persistedState };
    chain.maybeSingle.mockResolvedValueOnce({
      data: saved,
      error: null,
    });
    const reloaded = await snapshots.fetchSnapshot(planId);
    const replayed = reduceEvents(before, appended.events);
    const expected = {
      ...activity,
      ...patch,
      latitude: patch.latitude === null ? undefined : (patch.latitude ?? activity.latitude),
      longitude: patch.longitude === null ? undefined : (patch.longitude ?? activity.longitude),
    };
    expect(reloaded.days[0].activities[0]).toEqual(expect.objectContaining(expected));
    expect(reloaded.version).toBe(2);
    expect(replayed).toEqual({ version: reloaded.version, days: reloaded.days });
    expect(reduceEvents(reloaded, appended.events)).toEqual(replayed);
    if (patch.latitude === null) expect(JSON.stringify(persistedState)).not.toContain('"latitude"');
    if (patch.longitude === null) expect(JSON.stringify(persistedState)).not.toContain('"longitude"');
  });

  it.each([NaN, Infinity, -Infinity])(
    "rejects non-finite coordinates (%s) before persistence",
    async (value) => {
      for (const coordinate of ["latitude", "longitude"] as const) {
        const invalidActivity = { ...activity, [coordinate]: value };
        const events: EventInsert[] = [
          update({ [coordinate]: value }),
          {
            id: "created",
            planId,
            type: "activity.created",
            payload: { dayId: "day-1", activity: invalidActivity, position: "1024" },
          },
          {
            id: "day-created",
            planId,
            type: "day.created",
            payload: { day: { ...snapshotRow.state.days[0], activities: [invalidActivity] } },
          },
          {
            id: "day-updated",
            planId,
            type: "day.updated",
            payload: { dayId: "day-1", patch: { activities: [invalidActivity] } },
          },
        ];
        for (const event of events) {
          const { supabase, chain, service } = createPersistence();
          expect(appendEventsSchema.safeParse({ planId, baseVersion: 1, events: [event] }).success).toBe(
            false
          );
          await expect(service.appendEvents(planId, 1, [event])).rejects.toMatchObject({
            code: "BAD_REQUEST",
            message: expect.stringContaining(planId),
          });
          expect(chain.maybeSingle).not.toHaveBeenCalled();
          expect(supabase.rpc).not.toHaveBeenCalled();
        }
      }
    }
  );

  it.each(["0", true, {}, []])("rejects non-numeric coordinate input (%j)", (value) => {
    const event = { ...update({}), payload: { activityId: activity.id, patch: { latitude: value } } };
    expect(appendEventsSchema.safeParse({ planId, baseVersion: 1, events: [event] }).success).toBe(false);
  });

  it.each([
    { type: "activity.updated", payload: {} },
    { type: "activity.updated", payload: { activityId: activity.id, patch: null } },
    { type: "activity.created", payload: { dayId: "day-1", activity: {}, position: "1024" } },
    { type: "day.created", payload: { day: { id: "day-1", label: "Day 1" } } },
  ])("rejects malformed payloads instead of asserting EventInsert (%j)", (event) => {
    expect(
      appendEventsSchema.safeParse({
        planId,
        baseVersion: 1,
        events: [{ id: "invalid", planId, ...event }],
      }).success
    ).toBe(false);
  });
});
