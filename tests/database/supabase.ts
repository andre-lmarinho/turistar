import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../src/supabase/types";

const url = process.env.SUPABASE_TEST_URL;
const anonKey = process.env.SUPABASE_TEST_ANON_KEY;
const serviceKey = process.env.SUPABASE_TEST_SERVICE_ROLE_KEY;
if (!url || !anonKey || !serviceKey) {
  throw new Error("Run database integration tests with pnpm test:db.");
}
if (!["localhost", "127.0.0.1", "[::1]"].includes(new URL(url).hostname)) {
  throw new Error("Database integration tests require local Supabase.");
}
const auth = { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false };
const admin = createClient<Database>(url, serviceKey, { auth });
const createdUserIds = new Set<string>();

export async function createTestUser(username = `db-${randomUUID().slice(0, 8)}`) {
  const client = createClient<Database>(url as string, anonKey as string, { auth });
  const email = `db-${randomUUID()}@example.test`;
  const password = `Test-${randomUUID()}!`;
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { username, full_name: "Database test user" } },
  });
  if (data.user) createdUserIds.add(data.user.id);
  if (error || !data.user || !data.session) {
    throw new Error(
      `Auth test signup failed: ${error?.message ?? "local email confirmation must be disabled"}`
    );
  }
  return { client, id: data.user.id, username, email, password };
}

export async function cleanupTestUsers() {
  // Profiles have a non-cascading Auth FK. Delete only fixtures created by this suite.
  for (const id of createdUserIds) {
    const { error: profileError } = await admin.from("profiles").delete().eq("id", id);
    if (profileError)
      throw new Error(`Profile fixture cleanup failed for userId=${id}: ${profileError.message}`);
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) throw new Error(`Auth fixture cleanup failed for userId=${id}: ${error.message}`);
    createdUserIds.delete(id);
  }
}
