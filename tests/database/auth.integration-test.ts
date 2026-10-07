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
