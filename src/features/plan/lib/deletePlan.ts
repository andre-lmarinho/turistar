"use server";

import type { SupabaseClient } from "@supabase/supabase-js";

import { fetchProfileSlugByUserId } from "@/features/profile/repositories/ProfileRepository";
import { requireUser } from "@/shared/lib/auth/session";
import { formatSupabaseError } from "@/shared/lib/supabaseErrors";
import { createSupabaseServiceRoleClient } from "@/shared/lib/supabaseServiceRole";
import type { Database } from "@/shared/types/supabase";

import { fetchPlanByIdWithMembers } from "../repositories/PlanRepository";

type DeletePlanResult = {
  redirectTo: string;
};

type PlanRelatedTable =
  | "plan_events"
  | "plan_snapshots"
  | "budget_entries"
  | "plan_destinations"
  | "plan_share_links"
  | "plan_members";

const PLAN_RELATED_TABLES: PlanRelatedTable[] = [
  "plan_events",
  "plan_snapshots",
  "budget_entries",
  "plan_destinations",
  "plan_share_links",
  "plan_members",
];

export async function deletePlan(planId: string): Promise<DeletePlanResult> {
  const normalizedPlanId = planId.trim();
  if (!normalizedPlanId) {
    throw new Error("deletePlan: missing planId.");
  }

  const user = await requireUser();
  const plan = await fetchPlanByIdWithMembers(normalizedPlanId);

  if (!plan) {
    throw new Error(
      `Unable to delete plan: operation=deletePlan planId=${normalizedPlanId} userId=${user.id} reason=not-found`
    );
  }

  const isOwner = plan.ownerId === user.id;
  if (!isOwner) {
    throw new Error(
      `Unable to delete plan: operation=deletePlan planId=${normalizedPlanId} userId=${user.id} reason=unauthorized`
    );
  }

  const supabase = createSupabaseServiceRoleClient();
  const redirectTo = await resolvePlannerRedirect(user.id, supabase);

  // TODO: Wrap cascading deletes in a database transaction (RPC) for atomicity.
  // Currently, if a delete fails mid-way, the database may be left in an inconsistent state.
  for (const table of PLAN_RELATED_TABLES) {
    await deletePlanRows(supabase, table, normalizedPlanId);
  }

  const { error } = await supabase.from("plans").delete().eq("id", normalizedPlanId);
  if (error) {
    throw formatSupabaseError({
      operation: "deletePlan",
      identifiers: { planId: normalizedPlanId },
      error,
    });
  }

  return { redirectTo };
}

async function deletePlanRows(
  client: SupabaseClient<Database>,
  table: PlanRelatedTable,
  planId: string
): Promise<void> {
  const { error } = await client.from(table).delete().eq("plan_id", planId);
  if (error) {
    throw formatSupabaseError({
      operation: `deletePlan:${table}`,
      identifiers: { planId },
      error,
    });
  }
}

async function resolvePlannerRedirect(userId: string, client?: SupabaseClient<Database>): Promise<string> {
  try {
    const supabase = client ?? createSupabaseServiceRoleClient();
    const slug = await fetchProfileSlugByUserId(userId, { client: supabase });
    return slug ? `/u/${slug}/planners` : "/";
  } catch (error) {
    console.error("resolvePlannerRedirect failed", { userId, error });
    return "/";
  }
}
