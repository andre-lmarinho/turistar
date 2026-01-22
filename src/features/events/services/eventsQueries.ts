import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { buildSnapshotStateForAppend } from "@/features/snapshots/services/snapshotStateBuilder";
import { fetchSnapshot } from "@/features/snapshots/services/snapshotsQueries";

import {
  appendEvents as appendEventsRepository,
  fetchEvents as fetchEventsRepository,
} from "../repositories/EventsRepository";
import type { EventInsert, EventRecord } from "../types";
import { AppendEventsResponseSchema, EventRowSchema, mapEvent } from "./eventsSchemas";

type PlannerSupabaseClient = SupabaseClient;

export async function fetchEvents(
  planId: string,
  sinceVersion: number,
  client?: PlannerSupabaseClient
): Promise<EventRecord[]> {
  const data = await fetchEventsRepository(planId, sinceVersion, { client });
  if (!data.length) return [];
  const parsedRows = data.map((row) => EventRowSchema.parse(row));
  return parsedRows.map(mapEvent);
}

export async function appendEvents(
  planId: string,
  baseVersion: number,
  events: EventInsert[],
  client?: PlannerSupabaseClient
): Promise<{ events: EventRecord[]; version: number }> {
  const snapshot = await fetchSnapshot(planId, client);
  const history =
    snapshot.version > 0 && snapshot.days.length === 0 ? await fetchEvents(planId, 0, client) : undefined;
  const snapshotState = buildSnapshotStateForAppend({
    snapshot,
    baseVersion,
    events,
    history,
  });
  const data = await appendEventsRepository(planId, baseVersion, events, {
    client,
    snapshotState: snapshotState ?? undefined,
  });
  if (!data) {
    return { version: baseVersion, events: [] };
  }
  const { version, inserted_events } = AppendEventsResponseSchema.parse(data);
  return {
    version,
    events: inserted_events.map(mapEvent),
  };
}
