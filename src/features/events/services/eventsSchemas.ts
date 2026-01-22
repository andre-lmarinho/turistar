import { z } from "zod";

import type { EventRecord } from "../types";

const EventTypeSchema = z.enum([
  "activity.created",
  "activity.updated",
  "activity.deleted",
  "activity.moved",
  "day.created",
  "day.updated",
  "day.removed",
  "day.reordered",
]);

export const EventRowSchema = z.object({
  event_id: z.string(),
  plan_id: z.string(),
  version: z.number().positive(),
  event_type: EventTypeSchema,
  payload: z.unknown(),
  created_at: z.string(),
  actor_id: z.string().nullish(),
});

export const AppendEventsResponseSchema = z.object({
  version: z.number(),
  inserted_events: z.array(EventRowSchema),
});

export type EventRow = z.infer<typeof EventRowSchema>;

export function mapEvent(row: EventRow): EventRecord {
  return {
    id: row.event_id,
    planId: row.plan_id,
    version: row.version,
    type: row.event_type,
    createdAt: row.created_at,
    actorId: row.actor_id ?? undefined,
    payload: row.payload,
  } as EventRecord;
}
