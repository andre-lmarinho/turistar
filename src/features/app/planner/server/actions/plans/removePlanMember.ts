"use server";

import type { SupabaseClient } from "@supabase/supabase-js";

import { removePlanMember as removePlanMemberRpc } from "@/features/app/planner/server/repositories/PlanMembersRepository";
import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";

export async function removePlanMember(
  planId: string,
  userId: string,
  client: SupabaseClient = createSupabaseServerClient()
): Promise<void> {
  await removePlanMemberRpc(planId, userId, { client });
}
