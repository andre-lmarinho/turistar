import 'server-only';

import { fetchPlanBudget } from '@/features/app/planner/services/supabase/budgetQueries';

export async function getPlanBudget(planId: string) {
  return fetchPlanBudget(planId);
}
