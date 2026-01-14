"use server";

import type { PlanShareLink } from "@/features/app/planner/server/queries/plans/getPlanShareLink";
import { getPlanShareLink as getPlanShareLinkQuery } from "@/features/app/planner/server/queries/plans/getPlanShareLink";

export async function getPlanShareLink(planIdOrSlug: string): Promise<PlanShareLink | null> {
  return getPlanShareLinkQuery(planIdOrSlug);
}
