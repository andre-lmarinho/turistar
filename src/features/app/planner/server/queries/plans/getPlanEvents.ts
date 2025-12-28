import 'server-only';

import { fetchPlanEvents } from '@/features/app/planner/services/supabase/planEventsQueries';

export async function getPlanEvents(planId: string, sinceVersion: number) {
  return fetchPlanEvents(planId, sinceVersion);
}
