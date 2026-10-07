import { afterEach, expect, it } from "vitest";
import { cleanupTestUsers, createTestUser } from "./supabase";

afterEach(cleanupTestUsers);

it("provisions a readable profile before Auth signup returns", async () => {
  const { client, id, username } = await createTestUser();
  const { data, error } = await client
    .from("profiles")
    .select("id, slug, display_name")
    .eq("id", id)
    .single();
  expect(error).toBeNull();
  expect(data).toEqual({ id, slug: username, display_name: "Database test user" });
});

it("keeps account edits after metadata changes and a new login", async () => {
  const { client, id, email, password } = await createTestUser();
  const slug = `edited-${id.slice(0, 8)}`;
  const { error: updateError } = await client
    .from("profiles")
    .update({ slug, display_name: "Custom name", avatar_url: "custom-avatar" })
    .eq("id", id);
  expect(updateError).toBeNull();
  const { error: metadataError } = await client.auth.updateUser({
    data: { username: "stale-name", full_name: "Stale name", avatar_url: "stale-avatar" },
  });
  expect(metadataError).toBeNull();
  const { error: signOutError } = await client.auth.signOut();
  expect(signOutError).toBeNull();
  const { error: loginError } = await client.auth.signInWithPassword({ email, password });
  expect(loginError).toBeNull();
  const { data, error } = await client
    .from("profiles")
    .select("slug, display_name, avatar_url")
    .eq("id", id)
    .single();
  expect(error).toBeNull();
  expect(data).toEqual({ slug, display_name: "Custom name", avatar_url: "custom-avatar" });
});

it("allows concurrent signups requesting the same username", async () => {
  const username = `race-${crypto.randomUUID().slice(0, 8)}`;
  // Wait for both requests even if one fails, so cleanup cannot race a late signup.
  const results = await Promise.allSettled([createTestUser(username), createTestUser(username)]);
  const users = results.map((result) => {
    if (result.status === "rejected") throw result.reason;
    return result.value;
  });
  const slugs = await Promise.all(
    users.map(async ({ client, id }) => {
      const { data, error } = await client.from("profiles").select("slug").eq("id", id).single();
      expect(error).toBeNull();
      expect(data).not.toBeNull();
      return data?.slug;
    })
  );
  expect(new Set(slugs).size).toBe(2);
  expect(slugs).toContain(username);
  for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9][a-z0-9-]{0,27}$/);
});
