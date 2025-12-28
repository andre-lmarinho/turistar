import 'server-only';

import type {
  PostgrestMaybeSingleResponse,
  PostgrestResponse,
  PostgrestSingleResponse,
} from '@supabase/postgrest-js';
import type { SupabaseClient } from '@supabase/supabase-js';

import type {
  PlanEvent,
  PlanEventInsert,
  PlanSnapshot,
} from '@/features/app/planner/domain/types/PlanEvent';
import type { Database } from '@/shared/types/supabase';
import { createSupabaseServerClient } from '@/shared/lib/supabaseServer';

import {
  AppendEventsResponseSchema,
  EventRowSchema,
  SnapshotRowSchema,
  mapEvent,
  mapSnapshot,
} from './planEventsSchemas';
import { formatSupabaseError } from './supabaseErrors';

type PlannerSupabaseClient = SupabaseClient;

export async function fetchPlanSnapshot(
  planId: string,
  client?: PlannerSupabaseClient
): Promise<PlanSnapshot> {
  const supabase = client ?? createSupabaseServerClient();
  const response = (await supabase
    .from('plan_snapshots')
    .select('plan_id, version, state, updated_at')
    .eq('plan_id', planId)
    .maybeSingle()) as PostgrestMaybeSingleResponse<
    Database['public']['Tables']['plan_snapshots']['Row']
  >;
  const { data, error } = response;
  if (error) {
    throw formatSupabaseError({
      operation: 'fetchPlanSnapshot',
      identifiers: { planId },
      error,
    });
  }

  const parsed = SnapshotRowSchema.parse(
    data ?? {
      plan_id: planId,
      version: 0,
      state: { days: [] },
      updated_at: new Date(0).toISOString(),
    }
  );
  return mapSnapshot(parsed);
}

export async function fetchPlanEvents(
  planId: string,
  sinceVersion: number,
  client?: PlannerSupabaseClient
): Promise<PlanEvent[]> {
  const supabase = client ?? createSupabaseServerClient();
  const response = (await supabase
    .from('plan_events')
    .select('event_id, plan_id, version, event_type, payload, created_at, actor_id')
    .eq('plan_id', planId)
    .gt('version', sinceVersion)
    .order('version', { ascending: true })) as unknown as PostgrestResponse<
    Database['public']['Tables']['plan_events']['Row']
  >;
  const { data, error } = response;
  if (error) {
    throw formatSupabaseError({
      operation: 'fetchPlanEvents',
      identifiers: { planId, sinceVersion },
      error,
    });
  }
  if (!data) return [];
  const parsedRows = data.map((row) => EventRowSchema.parse(row));
  return parsedRows.map(mapEvent);
}

export async function appendPlanEvents(
  planId: string,
  baseVersion: number,
  events: PlanEventInsert[],
  client?: PlannerSupabaseClient
): Promise<{ events: PlanEvent[]; version: number }> {
  const supabase = client ?? createSupabaseServerClient();
  const response = (await supabase.rpc('append_plan_events', {
    plan_id: planId,
    base_version: baseVersion,
    events,
  })) as PostgrestSingleResponse<Database['public']['Functions']['append_plan_events']['Returns']>;
  const { data, error } = response;

  if (error) {
    throw formatSupabaseError({
      operation: 'appendPlanEvents',
      identifiers: { planId, baseVersion, eventCount: events.length },
      error,
    });
  }
  if (!data) {
    return { version: baseVersion, events: [] };
  }
  const { version, inserted_events } = AppendEventsResponseSchema.parse(data);
  return {
    version,
    events: inserted_events.map(mapEvent),
  };
}
