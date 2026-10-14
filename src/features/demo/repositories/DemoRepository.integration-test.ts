import { randomUUID } from "node:crypto";
import {
  admin,
  anonymous,
  cleanupFixtures,
  createPlan,
  localClient,
  signup,
} from "@tests/integration/supabase";
import { addDays, format, parseISO } from "date-fns";
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from "vitest";
import type { Database, Json } from "@/supabase/types";
import { DEMO_EMAIL, DEMO_PASSWORD } from "../lib/demo";
import { DemoRepository } from "./DemoRepository";

type Baseline = Database["public"]["Tables"]["demo_baseline"]["Row"];
type Calendar = { days: { id: string; label: string; activities: Json[] }[] };
const demo = localClient();
const repository = new DemoRepository(demo);
const emptyId = randomUUID();
let demoId: string;
let baselines: Baseline[] = [];

async function write(query: PromiseLike<{ error: { message: string } | null }>) {
  const { error } = await query;
  if (error) throw new Error(`Demo integration fixture operation failed: ${error.message}`);
}
async function expireReset() {
  await write(
    admin.from("demo_reset_state").update({ last_reset_at: "1970-01-01T00:00:00Z" }).eq("id", true)
  );
}
async function resetClock() {
  const { data, error } = await admin
    .from("demo_reset_state")
    .select("last_reset_at")
    .eq("id", true)
    .single();
  if (error || !data) throw new Error(`Demo reset clock read failed: ${error?.message}`);
  return data.last_reset_at;
}

beforeAll(async () => {
  const { data, error } = await demo.auth.signInWithPassword({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
  if (error || !data.user) throw new Error(`Demo fixture login failed: ${error?.message}`);
  demoId = data.user.id;
  const baseline = await admin
    .from("demo_baseline")
    .select("plan_id, plan, snapshot, budget")
    .order("plan_id");
  if (baseline.error || !baseline.data?.length) throw new Error("Demo integration requires seeded examples.");
  baselines = baseline.data;
});
beforeEach(async () => {
  await expireReset();
  await repository.resetIfStale();
  await expireReset();
});
afterEach(async () => {
  // Restore ownership before resetting, including when a protection assertion fails.
  try {
    await write(
      admin
        .from("plans")
        .update({ user_id: demoId })
        .in(
          "id",
          baselines.map((b) => b.plan_id)
        )
    );
    await write(admin.from("demo_baseline").delete().eq("plan_id", emptyId));
    await write(admin.from("plans").delete().eq("id", emptyId));
    await expireReset();
    await repository.resetIfStale();
  } finally {
    await cleanupFixtures();
  }
});
afterAll(async () => {
  await demo.auth.signOut({ scope: "local" });
});

it("denies maintenance data and anonymous resets, and ignores another authenticated account", async () => {
  const outsider = await signup();
  expect(outsider.error).toBeNull();
  const before = await resetClock();
  expect(await outsider.client.rpc("maybe_reset_demo")).toMatchObject({ data: false, error: null });
  expect(await resetClock()).toBe(before);
  expect((await anonymous.rpc("maybe_reset_demo")).error?.code).toBe("42501");
  for (const client of [anonymous, outsider.client, demo]) {
    expect((await client.from("demo_baseline").select("plan_id")).error?.code).toBe("42501");
    expect(
      (await client.from("demo_baseline").update({ budget: [] }).eq("plan_id", baselines[0].plan_id)).error
        ?.code
    ).toBe("42501");
    expect((await client.from("demo_reset_state").select("last_reset_at")).error?.code).toBe("42501");
    expect(
      (await client.from("demo_reset_state").update({ last_reset_at: "1970-01-01" }).eq("id", true)).error
        ?.code
    ).toBe("42501");
  }
});

it("recreates deleted examples and restores metadata, calendar, expenses and membership", async () => {
  const outsider = await signup();
  if (outsider.error || !outsider.data.user) throw new Error("Demo outsider fixture signup failed.");
  const otherId = await createPlan(outsider.client);
  const otherBefore = await admin
    .from("plans")
    .select("id, title, start_date, end_date, user_id")
    .eq("id", otherId)
    .single();
  expect(otherBefore.error).toBeNull();
  const otherSnapshot = await admin
    .from("plan_snapshots")
    .select("version, state")
    .eq("plan_id", otherId)
    .single();
  expect(otherSnapshot.error).toBeNull();
  const extraId = await createPlan(demo);
  const editedId = baselines[0].plan_id;
  await write(admin.from("plans").delete().eq("id", baselines[1].plan_id));
  await write(
    admin
      .from("plans")
      .update({
        title: "Edited",
        public_slug: "edited-demo-url",
        cover_image: "edited",
        destination_name: "Edited",
        budget: 999,
      })
      .eq("id", editedId)
  );
  await write(
    admin
      .from("plan_snapshots")
      .update({ version: 999, state: { days: [] } })
      .eq("plan_id", editedId)
  );
  await write(admin.from("budget_entries").delete().eq("plan_id", editedId));
  await write(admin.from("plan_members").insert({ plan_id: editedId, user_id: outsider.data.user.id }));
  await write(
    admin.from("plan_events").insert({
      plan_id: editedId,
      version: 999,
      event_type: "activity.updated",
      actor_id: demoId,
      payload: { activityId: "edited", patch: { title: "Edited" } },
    })
  );
  await write(
    admin
      .from("profiles")
      .update({ slug: "edited-demo", display_name: "Edited", avatar_url: "edited" })
      .eq("id", demoId)
  );

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bahia",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  await repository.resetIfStale();
  for (const baseline of baselines) {
    const plan = baseline.plan as Record<string, Json>;
    const { start_offset_days: offset, start_date: _start, end_date: _end, ...metadata } = plan;
    const { data: restored, error } = await admin
      .from("plans")
      .select(
        "id, title, budget, public_slug, cover_image, destination_name, destination_country, latitude, longitude, start_date, end_date"
      )
      .eq("id", baseline.plan_id)
      .single();
    expect(error).toBeNull();
    expect(restored).toMatchObject(metadata);
    expect(restored?.start_date).toBe(
      format(addDays(parseISO(today), plan.destination_name === "Rome" ? -1 : 30), "yyyy-MM-dd")
    );
    const { data: snapshot, error: snapshotError } = await admin
      .from("plan_snapshots")
      .select("version, state")
      .eq("plan_id", baseline.plan_id)
      .single();
    expect(snapshotError).toBeNull();
    if (!snapshot) throw new Error(`Demo snapshot missing for planId=${baseline.plan_id}`);
    expect(offset).toBe(plan.destination_name === "Rome" ? -1 : 30);
    const original = baseline.snapshot as { version: number; state: Calendar };
    const days = (snapshot.state as Calendar).days;
    expect(snapshot?.version).toBe(original.version);
    expect(days).toHaveLength(original.state.days.length);
    expect(restored?.start_date).toBe(days[0].id);
    expect(restored?.end_date).toBe(days.at(-1)?.id);
    days.forEach((day, index) => {
      expect(day.id).toBe(format(addDays(parseISO(days[0].id), index), "yyyy-MM-dd"));
      expect(day.label).toBe(format(parseISO(day.id), "EEE, dd MMM"));
      expect(day.activities).toEqual(original.state.days[index].activities);
    });
    const expenses = await admin
      .from("budget_entries")
      .select("id, description, category, amount")
      .eq("plan_id", baseline.plan_id)
      .order("id");
    expect(expenses.error).toBeNull();
    expect(expenses.data).toEqual(
      (baseline.budget as { id: string }[]).toSorted((a, b) => a.id.localeCompare(b.id))
    );
    const members = await admin.from("plan_members").select("user_id, tier").eq("plan_id", baseline.plan_id);
    expect(members.error).toBeNull();
    expect(members.data).toEqual([{ user_id: demoId, tier: "admin" }]);
    const events = await admin.from("plan_events").select("id").eq("plan_id", baseline.plan_id);
    expect(events.error).toBeNull();
    expect(events.data).toEqual([]);
  }
  const extra = await admin.from("plans").select("id").eq("id", extraId);
  expect(extra.error).toBeNull();
  expect(extra.data).toEqual([]);
  expect(
    await admin.from("plans").select("id, title, start_date, end_date, user_id").eq("id", otherId).single()
  ).toMatchObject({ data: otherBefore.data, error: null });
  expect(
    await admin.from("plan_snapshots").select("version, state").eq("plan_id", otherId).single()
  ).toMatchObject({ data: otherSnapshot.data, error: null });
  expect(
    await admin.from("profiles").select("slug, display_name, avatar_url").eq("id", demoId).single()
  ).toMatchObject({ data: { slug: "demouser", display_name: "Demo User", avatar_url: null }, error: null });
});

it("allows only one concurrent reset and skips further calls within an hour", async () => {
  const results = await Promise.all([demo.rpc("maybe_reset_demo"), demo.rpc("maybe_reset_demo")]);
  expect(results.map(({ error }) => error)).toEqual([null, null]);
  expect(results.map(({ data }) => data).sort()).toEqual([false, true]);
  const clock = await resetClock();
  expect(await demo.rpc("maybe_reset_demo")).toMatchObject({ data: false, error: null });
  expect(await resetClock()).toBe(clock);
});

it("clears edited dates and images when an example has an empty calendar", async () => {
  await write(
    admin.from("demo_baseline").insert({
      plan_id: emptyId,
      plan: {
        title: "Empty example",
        public_slug: `empty-${emptyId}`,
        start_date: null,
        end_date: null,
        cover_image: null,
      },
      snapshot: { version: 0, state: { days: [] } },
      budget: [],
    })
  );
  await write(
    admin.from("plans").insert({
      id: emptyId,
      user_id: demoId,
      title: "Edited",
      public_slug: `empty-${emptyId}`,
      start_date: "2026-10-01",
      end_date: "2026-10-02",
      cover_image: "edited",
    })
  );
  await repository.resetIfStale();
  expect(
    await admin.from("plans").select("title, start_date, end_date, cover_image").eq("id", emptyId).single()
  ).toMatchObject({
    data: { title: "Empty example", start_date: null, end_date: null, cover_image: null },
    error: null,
  });
});

it("refuses to overwrite an example transferred to another account", async () => {
  const outsider = await signup();
  if (outsider.error || !outsider.data.user) throw new Error("Demo ownership fixture signup failed.");
  const id = baselines[0].plan_id;
  await write(
    admin.from("plans").update({ user_id: outsider.data.user.id, title: "Transferred trip" }).eq("id", id)
  );
  const clock = await resetClock();
  await expect(repository.resetIfStale()).rejects.toThrow(/baseline plan is not owned by demo/);
  expect(await admin.from("plans").select("user_id, title").eq("id", id).single()).toMatchObject({
    data: { user_id: outsider.data.user.id, title: "Transferred trip" },
    error: null,
  });
  expect(await resetClock()).toBe(clock);
});
