import { z } from "zod";

import type { EventInsert, EventRecord } from "../types";

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

const ActivityInputSchema = z.object({
  id: z.string(),
  title: z.string(),
  color: z.string(),
  position: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  duration: z.number().optional(),
  startTime: z.string().optional(),
  imageUrl: z.string().optional(),
  budget: z.number().optional(),
  category: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  _optimistic: z.boolean().optional(),
});

const DayInputSchema = z.object({
  id: z.string(),
  label: z.string(),
  position: z.string().optional(),
  activities: z.array(ActivityInputSchema),
});

const EventInsertBaseSchema = z.object({
  id: z.string().min(1),
  planId: z.string().min(1),
  actorId: z.string().nullish(),
});

// validate the existing event contract with Zod; no separate validation layer.
export const EventInsertSchema = z.discriminatedUnion("type", [
  EventInsertBaseSchema.extend({
    type: z.literal("activity.created"),
    payload: z.object({ dayId: z.string(), activity: ActivityInputSchema, position: z.string() }),
  }),
  EventInsertBaseSchema.extend({
    type: z.literal("activity.updated"),
    payload: z.object({
      activityId: z.string(),
      patch: ActivityInputSchema.partial().extend({
        latitude: z.number().nullish(),
        longitude: z.number().nullish(),
      }),
    }),
  }),
  EventInsertBaseSchema.extend({
    type: z.literal("activity.deleted"),
    payload: z.object({ activityId: z.string() }),
  }),
  EventInsertBaseSchema.extend({
    type: z.literal("activity.moved"),
    payload: z.object({
      activityId: z.string(),
      fromDayId: z.string(),
      toDayId: z.string(),
      position: z.string(),
    }),
  }),
  EventInsertBaseSchema.extend({
    type: z.literal("day.created"),
    payload: z.object({ day: DayInputSchema.extend({ position: z.string() }) }),
  }),
  EventInsertBaseSchema.extend({
    type: z.literal("day.updated"),
    payload: z.object({ dayId: z.string(), patch: DayInputSchema.partial() }),
  }),
  EventInsertBaseSchema.extend({
    type: z.literal("day.removed"),
    payload: z.object({ dayId: z.string() }),
  }),
  EventInsertBaseSchema.extend({
    type: z.literal("day.reordered"),
    payload: z.object({ dayId: z.string(), position: z.string() }),
  }),
]) satisfies z.ZodType<EventInsert>;

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
