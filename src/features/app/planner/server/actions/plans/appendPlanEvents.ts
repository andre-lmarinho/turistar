'use server';

import type { PlanEventInsert } from '@/features/app/planner/domain/types/PlanEvent';
import { appendPlanEvents as appendPlanEventsRepo } from '@/features/app/planner/services/supabase/planEventsQueries';

export async function appendPlanEvents(
  planId: string,
  baseVersion: number,
  events: PlanEventInsert[]
) {
  return appendPlanEventsRepo(planId, baseVersion, events);
}
