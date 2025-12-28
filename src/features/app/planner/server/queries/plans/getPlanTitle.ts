import 'server-only';

import { fetchPlanTitle } from '@/features/app/planner/services/supabase/planTitleQueries';

export async function getPlanTitle(planId: string) {
  return fetchPlanTitle(planId);
}
