import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import type { PlanEventInsert } from '@/features/app/planner/domain/types/PlanEvent';
import { formatSupabaseError } from '@/features/app/planner/services/supabase/supabaseErrors';
import { createSupabaseServerClient } from '@/shared/lib/supabaseServer';
import type { Database } from '@/shared/types/supabase';

type PlanEventsRepositoryOptions = {
  client?: SupabaseClient;
};

export type PlanEventRow = Database['public']['Tables']['plan_events']['Row'];
export type AppendPlanEventsResponse =
  Database['public']['Functions']['append_plan_events']['Returns'];

function getClient(client?: SupabaseClient): SupabaseClient {
  return client ?? createSupabaseServerClient();
}

export async function fetchPlanEvents(
  planId: string,
  sinceVersion: number,
  { client }: PlanEventsRepositoryOptions = {}
): Promise<PlanEventRow[]> {
  const supabase = getClient(client);
  const { data, error } = (await supabase
    .from('plan_events')
    .select('event_id, plan_id, version, event_type, payload, created_at, actor_id')
    .eq('plan_id', planId)
    .gt('version', sinceVersion)
    .order('version', { ascending: true })) as unknown as {
    data: PlanEventRow[] | null;
    error: unknown;
  };

  if (error) {
    throw formatSupabaseError({
      operation: 'fetchPlanEvents',
      identifiers: { planId, sinceVersion },
      error,
    });
  }

  return data ?? [];
}

export async function appendPlanEvents(
  planId: string,
  baseVersion: number,
  events: PlanEventInsert[],
  { client }: PlanEventsRepositoryOptions = {}
): Promise<AppendPlanEventsResponse | null> {
  const supabase = getClient(client);
  const { data, error } = (await supabase.rpc('append_plan_events', {
    plan_id: planId,
    base_version: baseVersion,
    events,
  })) as unknown as {
    data: AppendPlanEventsResponse | null;
    error: unknown;
  };

  if (error) {
    throw formatSupabaseError({
      operation: 'appendPlanEvents',
      identifiers: { planId, baseVersion, eventCount: events.length },
      error,
    });
  }

  return data ?? null;
}
