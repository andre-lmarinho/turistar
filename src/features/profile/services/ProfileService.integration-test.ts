import { randomUUID } from "node:crypto";
import {
  admin,
  anonymous,
  cleanupFixtures,
  createPlan,
  findAuthUser,
  signup,
} from "@tests/integration/supabase";
import { afterEach, expect, it } from "vitest";
import { ProfileRepository } from "../repositories/ProfileRepository";
import { ProfileService } from "./ProfileService";

afterEach(cleanupFixtures);

it("creates the requested profile before signup returns", async () => {
  const username = `profile-${randomUUID().slice(0, 8)}`;
  const { client, data, error } = await signup(username);
  expect(error).toBeNull();
  expect(data.session !== null).toBe(true);
  const id = data.user?.id;
  if (!id) throw new Error("Signup returned no Auth user.");
  const service = new ProfileService(new ProfileRepository(client));
  expect(await service.ensureProfile({ id })).toBe(username);
});

it("preserves account edits when the application resolves the profile after login", async () => {
  const { client, data, error, email, password } = await signup(`profile-${randomUUID().slice(0, 8)}`);
  expect(error).toBeNull();
  const id = data.user?.id;
  if (!id) throw new Error("Signup returned no Auth user.");
  const service = new ProfileService(new ProfileRepository(client));
  const slug = `edited-${id.slice(0, 8)}`;
  await service.updateViewerProfile(id, { slug, displayName: "Custom name" });
  const { error: avatarError } = await client
    .from("profiles")
    .update({ avatar_url: "custom-avatar" })
    .eq("id", id);
  expect(avatarError).toBeNull();
  const { error: signOutError } = await client.auth.signOut();
  expect(signOutError).toBeNull();
  const { data: login, error: loginError } = await client.auth.signInWithPassword({ email, password });
  expect(loginError).toBeNull();
  if (!login.user) throw new Error("Login returned no Auth user.");
  // This is the application call that previously upserted stale Auth metadata.
  expect(await service.ensureProfile(login.user)).toBe(slug);
  expect(await service.getViewerProfile(id)).toMatchObject({
    slug,
    displayName: "Custom name",
    avatarUrl: "custom-avatar",
  });
});

it("rejects a duplicate username without creating another account or renaming the profile", async () => {
  const username = `profile-${randomUUID().slice(0, 8)}`;
  const first = await signup(username);
  expect(first.error).toBeNull();
  const second = await signup(username);
  expect(second.error !== null).toBe(true);
  expect(second.data.user).toBeNull();
  expect(await findAuthUser(second.email)).toBeNull();
  const { data, error } = await admin.from("profiles").select("id, slug").eq("slug", username);
  expect(error).toBeNull();
  expect(data).toEqual([{ id: first.data.user?.id, slug: username }]);
});

it.each(["", "INVALID USERNAME", "-invalid", "a".repeat(29)])(
  "rejects invalid username %j",
  async (username) => {
    const { data, error, email } = await signup(username);
    expect(error !== null).toBe(true);
    expect(data.user).toBeNull();
    expect(await findAuthUser(email)).toBeNull();
  }
);

it("allows one concurrent signup for a requested username", async () => {
  const username = `race-${randomUUID().slice(0, 8)}`;
  const results = await Promise.allSettled([signup(username), signup(username)]);
  const signups = results.map((result) => {
    if (result.status === "rejected") throw result.reason;
    return result.value;
  });
  expect(signups.filter(({ error }) => error === null)).toHaveLength(1);
  const failed = signups.find(({ error }) => error !== null);
  if (!failed) throw new Error("Expected a rejected concurrent signup.");
  expect(await findAuthUser(failed.email)).toBeNull();
});

it("enforces profile ownership, shared-plan visibility, and Auth-owned creation/deletion", async () => {
  const owner = await signup();
  const member = await signup();
  const outsider = await signup();
  if (!owner.data.user || !member.data.user || !outsider.data.user) throw new Error("Fixture signup failed.");
  const id = member.data.user.id;
  const profile = new ProfileRepository(owner.client);
  expect(await profile.fetchProfileByUserId(id)).toBeNull();
  const planId = await createPlan(owner.client);
  const { error: inviteError } = await owner.client.rpc("add_plan_member_by_email", {
    _plan_id: planId,
    _email: member.email,
  });
  expect(inviteError).toBeNull();
  expect(await profile.fetchProfileByUserId(id)).toMatchObject({ userId: id });
  expect(await new ProfileRepository(outsider.client).fetchProfileByUserId(id)).toBeNull();
  const before = await new ProfileRepository(member.client).fetchProfileByUserId(id);
  const denied = await owner.client
    .from("profiles")
    .update({ display_name: "Stolen name" })
    .eq("id", id)
    .select("id");
  expect(denied.error).toBeNull();
  expect(denied.data).toEqual([]);
  expect(await new ProfileRepository(member.client).fetchProfileByUserId(id)).toEqual(before);
  const insert = await owner.client
    .from("profiles")
    .insert({ id: owner.data.user.id, slug: "manual-profile" });
  expect(insert.error?.code).toBe("42501");
  const remove = await owner.client.from("profiles").delete().eq("id", owner.data.user.id);
  expect(remove.error?.code).toBe("42501");
  const read = await anonymous.from("profiles").select("id").eq("id", id);
  expect(read.error?.code).toBe("42501");
});
