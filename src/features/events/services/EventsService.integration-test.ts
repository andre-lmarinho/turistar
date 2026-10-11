import { randomUUID } from "node:crypto";
import { anonymous, cleanupFixtures, createPlan, signup } from "@tests/integration/supabase";
import { afterEach, beforeEach, expect, it } from "vitest";
import { PlanRepository } from "@/features/plan/repositories/PlanRepository";
import { SnapshotsRepository } from "@/features/snapshots/repositories/SnapshotsRepository";
import { SnapshotsService } from "@/features/snapshots/services/SnapshotsService";
import type { Json } from "@/supabase/types";
import { EventsRepository } from "../repositories/EventsRepository";
import type { ActivityPatch, EventInsert } from "../types";
import { EventsService } from "./EventsService";

let owner: Awaited<ReturnType<typeof signup>>;
let planId: string;
let events: EventsRepository;
let snapshots: SnapshotsService;
let service: EventsService;

beforeEach(async () => {
  owner = await signup();
  if (owner.error || !owner.data.user) throw new Error("Event fixture signup failed.");
  planId = await createPlan(owner.client);
  events = new EventsRepository(owner.client);
  snapshots = new SnapshotsService(new SnapshotsRepository(owner.client));
  service = new EventsService(events, snapshots);
});
afterEach(cleanupFixtures);

function createDay(): EventInsert {
  return {
    id: randomUUID(),
    planId,
    type: "day.created",
    payload: {
      day: {
        id: "2026-10-01",
        label: "Day 1",
        position: "1024",
        activities: [
          {
            id: "activity-1",
            title: "Museum",
            color: "blue",
            position: "1024",
            latitude: 0,
            longitude: -43.2,
          },
        ],
      },
    },
  };
}
function updateActivity(patch: ActivityPatch): EventInsert {
  return { id: randomUUID(), planId, type: "activity.updated", payload: { activityId: "activity-1", patch } };
}

it.each([
  { latitude: null, longitude: null },
  { latitude: 0, longitude: 0 },
  { title: "Updated museum" },
] satisfies ActivityPatch[])(
  "persists coordinates through the real service, event log, and snapshot: %j",
  async (patch) => {
    await service.appendEvents(planId, 0, [createDay()]);
    const appended = await service.appendEvents(planId, 1, [updateActivity(patch)]);
    expect(appended.version).toBe(2);
    expect(appended.events[0].actorId).toBe(owner.data.user?.id);
    expect((await events.fetchEvents(planId, 1))[0].payload).toEqual({ activityId: "activity-1", patch });
    const snapshot = await snapshots.fetchSnapshot(planId);
    expect(snapshot.version).toBe(2);
    const activity = snapshot.days[0].activities[0];
    if (patch.latitude === null) {
      expect(activity.latitude).toBeUndefined();
      expect(activity.longitude).toBeUndefined();
      const row = await new SnapshotsRepository(owner.client).fetchSnapshot(planId);
      expect(JSON.stringify(row?.state)).not.toContain('"latitude"');
      expect(JSON.stringify(row?.state)).not.toContain('"longitude"');
      return;
    }
    expect(activity).toMatchObject({ latitude: 0, longitude: patch.longitude ?? -43.2, ...patch });
  }
);

it("preserves the event log and snapshot when a stale writer appends", async () => {
  await service.appendEvents(planId, 0, [createDay()]);
  const before = await snapshots.fetchSnapshot(planId);
  expect(await service.appendEvents(planId, 0, [updateActivity({ title: "Stale edit" })])).toEqual({
    version: 1,
    events: [],
  });
  expect(await events.fetchEvents(planId, 0)).toHaveLength(1);
  expect(await snapshots.fetchSnapshot(planId)).toEqual(before);
});

it("rolls back an entire RPC batch when its second event violates database validation", async () => {
  const before = await snapshots.fetchSnapshot(planId);
  const { error } = await owner.client.rpc("append_plan_events", {
    plan_id: planId,
    base_version: 0,
    events: [createDay() as unknown as Json, { id: randomUUID(), type: "activity.created", payload: {} }],
    snapshot_state: { days: [] },
  });
  expect(error?.code).toBe("22023");
  expect(await events.fetchEvents(planId, 0)).toEqual([]);
  expect(await snapshots.fetchSnapshot(planId)).toEqual(before);
});

it("serializes concurrent writers sharing a base version", async () => {
  await service.appendEvents(planId, 0, [createDay()]);
  const results = await Promise.allSettled([
    service.appendEvents(planId, 1, [updateActivity({ title: "First contender" })]),
    service.appendEvents(planId, 1, [updateActivity({ title: "Second contender" })]),
  ]);
  const writes = results.map((result) => {
    if (result.status === "rejected") throw result.reason;
    return result.value;
  });
  expect(writes.map(({ events }) => events.length).sort()).toEqual([0, 1]);
  expect(writes.map(({ version }) => version)).toEqual([2, 2]);
  const history = await service.fetchEvents(planId, 0);
  expect(history).toHaveLength(2);
  const winner = writes.find(({ events }) => events.length === 1)?.events[0];
  if (winner?.type !== "activity.updated") throw new Error("No winning activity update.");
  expect((await snapshots.fetchSnapshot(planId)).days[0].activities[0].title).toBe(
    winner.payload.patch.title
  );
});

it("allows invited members to write while denying outsider and anonymous access", async () => {
  const member = await signup();
  const outsider = await signup();
  if (!member.data.user || !outsider.data.user) throw new Error("Membership fixture signup failed.");
  expect(await new PlanRepository(outsider.client).fetchPlanIdentityById(planId)).toBeNull();
  const { error: inviteError } = await owner.client.rpc("add_plan_member_by_email", {
    _plan_id: planId,
    _email: member.email,
  });
  expect(inviteError).toBeNull();
  const memberEvents = new EventsRepository(member.client);
  const memberService = new EventsService(
    memberEvents,
    new SnapshotsService(new SnapshotsRepository(member.client))
  );
  const spoofed = { ...createDay(), actorId: outsider.data.user.id };
  expect((await memberService.appendEvents(planId, 0, [spoofed])).events[0].actorId).toBe(
    member.data.user.id
  );
  const before = await snapshots.fetchSnapshot(planId);
  const outsiderEvents = new EventsRepository(outsider.client);
  expect(await outsiderEvents.fetchEvents(planId, 0)).toEqual([]);
  await expect(
    outsiderEvents.appendEvents(planId, 1, [updateActivity({ title: "Unauthorized" })])
  ).rejects.toThrow(/not authorized/);
  const denied = await anonymous.from("plans").select("id").eq("id", planId);
  expect(denied.error?.code).toBe("42501");
  expect(await events.fetchEvents(planId, 0)).toHaveLength(1);
  expect(await snapshots.fetchSnapshot(planId)).toEqual(before);
});
