import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { PlanEvent, PlanEventInsert, PlanSnapshot } from "@/features/app/planner/domain/types/PlanEvent";
import {
  appendPlanEvents as appendPlanEventsRepository,
  fetchPlanEvents as fetchPlanEventsRepository,
} from "@/features/app/planner/server/repositories/PlanEventsRepository";
import { fetchPlanSnapshot as fetchPlanSnapshotRepository } from "@/features/app/planner/server/repositories/PlanSnapshotsRepository";

import {
  AppendEventsResponseSchema,
  EventRowSchema,
  mapEvent,
  mapSnapshot,
  SnapshotRowSchema,
} from "./planEventsSchemas";

type PlannerSupabaseClient = SupabaseClient;

export async function fetchPlanSnapshot(
  planId: string,
  client?: PlannerSupabaseClient
): Promise<PlanSnapshot> {
  const data = await fetchPlanSnapshotRepository(planId, { client });
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
  const data = await fetchPlanEventsRepository(planId, sinceVersion, { client });
  if (!data.length) return [];
  const parsedRows = data.map((row) => EventRowSchema.parse(row));
  return parsedRows.map(mapEvent);
}

export async function appendPlanEvents(
  planId: string,
  baseVersion: number,
  events: PlanEventInsert[],
  client?: PlannerSupabaseClient
): Promise<{ events: PlanEvent[]; version: number }> {
  const data = await appendPlanEventsRepository(planId, baseVersion, events, { client });
  if (!data) {
    return { version: baseVersion, events: [] };
  }
  const { version, inserted_events } = AppendEventsResponseSchema.parse(data);
  return {
    version,
    events: inserted_events.map(mapEvent),
  };
}
