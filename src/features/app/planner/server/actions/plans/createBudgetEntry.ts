"use server";

import { createBudgetEntry as createBudgetEntryRepo } from "@/features/app/planner/services/supabase/budgetQueries";
import type { CategoryKey } from "@/features/app/planner/types/budget";

type BudgetEntryInput = {
  description: string;
  category: CategoryKey;
  amount: number;
};

export async function createBudgetEntry(planId: string, payload: BudgetEntryInput) {
  return createBudgetEntryRepo(planId, payload);
}
