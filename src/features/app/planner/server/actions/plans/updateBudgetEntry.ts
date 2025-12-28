'use server';

import type { Entry } from '@/features/app/planner/types/budget';
import { updateBudgetEntry as updateBudgetEntryRepo } from '@/features/app/planner/services/supabase/budgetQueries';

export async function updateBudgetEntry(entry: Entry) {
  return updateBudgetEntryRepo(entry);
}
