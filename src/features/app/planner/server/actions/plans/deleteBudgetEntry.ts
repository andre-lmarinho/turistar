'use server';

import { deleteBudgetEntry as deleteBudgetEntryRepo } from '@/features/app/planner/services/supabase/budgetQueries';

export async function deleteBudgetEntry(entryId: string) {
  return deleteBudgetEntryRepo(entryId);
}
