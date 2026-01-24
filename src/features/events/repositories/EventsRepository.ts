import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { EventInsert } from "@/features/events/types";
import type { SnapshotRow } from "@/features/snapshots/repositories/SnapshotsRepository";
import { formatSupabaseError } from "@/shared/lib/supabaseErrors";
import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";
import type { Database } from "@/shared/types/supabase";

type EventsRepositoryOptions = {
  client?: SupabaseClient;
};

export type EventRow = Database["public"]["Tables"]["plan_events"]["Row"];
export type AppendEventsResponse = Database["public"]["Functions"]["append_plan_events"]["Returns"];
type SnapshotState = SnapshotRow["state"];

type AppendPlanEventsArgs = Database["public"]["Functions"]["append_plan_events"]["Args"] & {
  snapshot_state?: SnapshotState;
};

type AppendEventsOptions = EventsRepositoryOptions & {
  snapshotState?: SnapshotState;
};

function getClient(client?: SupabaseClient): SupabaseClient {
  return client ?? createSupabaseServerClient();
}

export async function fetchEvents(
  planId: string,
  sinceVersion: number,
  { client }: EventsRepositoryOptions = {}
): Promise<EventRow[]> {
  const supabase = getClient(client);
  const { data, error } = (await supabase
    .from("plan_events")
    .select("event_id, plan_id, version, event_type, payload, created_at, actor_id")
    .eq("plan_id", planId)
    .gt("version", sinceVersion)
    .order("version", { ascending: true })) as unknown as {
    data: EventRow[] | null;
    error: unknown;
  };

  if (error) {
    throw formatSupabaseError({
      operation: "fetchEvents",
      identifiers: { planId, sinceVersion },
      error,
    });
  }

  return data ?? [];
}

export async function appendEvents(
  planId: string,
  baseVersion: number,
  events: EventInsert[],
  { client, snapshotState }: AppendEventsOptions = {}
): Promise<AppendEventsResponse | null> {
  const supabase = getClient(client);
  const args: AppendPlanEventsArgs = {
    plan_id: planId,
    base_version: baseVersion,
    events,
    ...(snapshotState ? { snapshot_state: snapshotState } : {}),
  };
  const { data, error } = (await supabase.rpc("append_plan_events", args)) as unknown as {
    data: AppendEventsResponse | null;
    error: unknown;
  };

  if (error) {
    throw formatSupabaseError({
      operation: "appendEvents",
      identifiers: { planId, baseVersion, eventCount: events.length },
      error,
    });
  }

  return data ?? null;
}
