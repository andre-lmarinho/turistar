"use server";

import { getPlanBudget as getPlanBudgetQuery } from "@/features/app/planner/server/queries/plans/getPlanBudget";

export async function getPlanBudget(planId: string) {
  return getPlanBudgetQuery(planId);
}
