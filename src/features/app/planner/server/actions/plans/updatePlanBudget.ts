"use server";

import { updatePlanBudget as updatePlanBudgetRepo } from "@/features/app/planner/services/supabase/budgetQueries";

export async function updatePlanBudget(planId: string, newBudget: number) {
  return updatePlanBudgetRepo(planId, newBudget);
}
