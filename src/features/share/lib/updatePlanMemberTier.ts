"use server";

import type { SupabaseClient } from "@supabase/supabase-js";

import { updatePlanMemberTier as updatePlanMemberTierRpc } from "@/features/share/repositories/PlanMembersRepository";
import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";

type PlanMemberTier = "admin" | "member";

export async function updatePlanMemberTier(
  planId: string,
  userId: string,
  tier: PlanMemberTier,
  client: SupabaseClient = createSupabaseServerClient()
): Promise<void> {
  await updatePlanMemberTierRpc(planId, userId, tier, { client });
}
