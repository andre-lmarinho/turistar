import 'server-only';

import { fetchPlanSnapshot } from '@/features/app/planner/services/supabase/planEventsQueries';

export async function getPlanSnapshot(planId: string) {
  return fetchPlanSnapshot(planId);
}
