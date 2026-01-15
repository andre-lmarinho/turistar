"use server";

import type { SupabaseClient } from "@supabase/supabase-js";

import { leavePlan as leavePlanRpc } from "@/features/share/repositories/PlanMembersRepository";
import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";

export async function leavePlan(
  planId: string,
  client: SupabaseClient = createSupabaseServerClient()
): Promise<void> {
  await leavePlanRpc(planId, { client });
}
