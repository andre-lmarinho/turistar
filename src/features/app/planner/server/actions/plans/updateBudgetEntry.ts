"use server";

import { updateBudgetEntry as updateBudgetEntryRepo } from "@/features/app/planner/services/supabase/budgetQueries";
import type { Entry } from "@/features/app/planner/types/budget";

export async function updateBudgetEntry(entry: Entry) {
  return updateBudgetEntryRepo(entry);
}
