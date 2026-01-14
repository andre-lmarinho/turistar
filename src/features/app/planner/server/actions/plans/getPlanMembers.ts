"use server";

import { getPlanMembers as getPlanMembersQuery } from "@/features/app/planner/server/queries/plans/getPlanMembers";

export async function getPlanMembers(planIdOrSlug: string) {
  return getPlanMembersQuery(planIdOrSlug);
}
