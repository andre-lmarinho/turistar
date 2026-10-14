import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { PlanRepository } from "@/features/plan/repositories/PlanRepository";
import type { Database } from "@/supabase/types";

// Discover only the local stack; never load hosted credentials or print status/session data.
const status = spawnSync("supabase", ["status", "-o", "json"], { encoding: "utf8" });
if (status.status !== 0) throw new Error("Integration tests require supabase start and pnpm db:migrate.");
const local: { API_URL: string; ANON_KEY: string; SERVICE_ROLE_KEY: string } = JSON.parse(status.stdout);
if (!["localhost", "127.0.0.1", "[::1]"].includes(new URL(local.API_URL).hostname)) {
  throw new Error("Integration tests require local Supabase.");
}
const auth = { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false };
export function localClient() {
  return createClient<Database>(local.API_URL, local.ANON_KEY, { auth });
}
export const admin = createClient<Database>(local.API_URL, local.SERVICE_ROLE_KEY, { auth });
export const anonymous = createClient<Database>(local.API_URL, local.ANON_KEY, { auth });
const userIds = new Set<string>();
const planIds = new Set<string>();

export async function signup(username = `integration-${randomUUID().slice(0, 8)}`) {
  const client = localClient();
  const email = `integration-${randomUUID()}@example.test`;
  const password = `Test-${randomUUID()}!`;
  const result = await client.auth.signUp({ email, password, options: { data: { username } } });
  if (result.data.user) userIds.add(result.data.user.id);
  return { client, email, password, ...result };
}

export async function createPlan(client: SupabaseClient<Database>) {
  const { id } = await new PlanRepository(client).createPlan({
    title: "Integration test",
    destName: "Test destination",
    startDate: "2026-10-01",
    endDate: "2026-10-02",
  });
  planIds.add(id);
  return id;
}

export async function findAuthUser(email: string) {
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw new Error(`Auth fixture lookup failed: ${error.message}`);
    const user = data.users.find((user) => user.email === email);
    if (user) return user;
    if (data.users.length < 100) return null;
  }
}

export async function cleanupFixtures() {
  // FK order matters. Remove only fixtures registered by this test file's worker.
  for (const id of planIds) {
    const { error } = await admin.from("plans").delete().eq("id", id);
    if (error) throw new Error(`Plan cleanup failed for planId=${id}: ${error.message}`);
    planIds.delete(id);
  }
  for (const id of userIds) {
    const { error: profileError } = await admin.from("profiles").delete().eq("id", id);
    if (profileError) throw new Error(`Profile cleanup failed for userId=${id}: ${profileError.message}`);
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) throw new Error(`Auth cleanup failed for userId=${id}: ${error.message}`);
    userIds.delete(id);
  }
}
