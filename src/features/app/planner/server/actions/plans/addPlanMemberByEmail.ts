"use server";

import type { SupabaseClient } from "@supabase/supabase-js";

import { addPlanMemberByEmail as addPlanMemberByEmailRpc } from "@/features/app/planner/server/repositories/PlanMembersRepository";
import { isSupabaseUserNotRegisteredError } from "@/shared/lib/supabaseErrors";
import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";

type PlanMemberTier = "admin" | "member";

export type AddPlanMemberResult = {
  userId: string;
  tier: PlanMemberTier;
};

export async function addPlanMemberByEmail(
  planId: string,
  email: string,
  tier: PlanMemberTier,
  client: SupabaseClient = createSupabaseServerClient()
): Promise<AddPlanMemberResult> {
  let data: Awaited<ReturnType<typeof addPlanMemberByEmailRpc>>;
  try {
    data = await addPlanMemberByEmailRpc(planId, email, tier, { client });
  } catch (error) {
    if (isSupabaseUserNotRegisteredError(error)) {
      const err = new Error("USER_NOT_REGISTERED");
      (err as { code?: string }).code = "USER_NOT_REGISTERED";
      throw err;
    }

    throw error;
  }

  const row = data?.[0] ?? null;

  if (!row) {
    const err = new Error("USER_NOT_REGISTERED");
    (err as { code?: string }).code = "USER_NOT_REGISTERED";
    throw err;
  }

  return { userId: row.user_id, tier: row.tier };
}
