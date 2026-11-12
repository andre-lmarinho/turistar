import { z } from "zod";

import type { EventInsert, EventRecord } from "../types";

// Per-operation payload schemas: the single wire contract for inserted and stored events.
const ActivityPayloadSchema = z.object({
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
});

const DayPayloadSchema = z.object({
  id: z.string(),
  label: z.string(),
  position: z.string().optional(),
  activities: z.array(ActivityPayloadSchema),
});

const ActivityCreatedPayloadSchema = z.object({
  dayId: z.string(),
  activity: ActivityPayloadSchema,
  position: z.string(),
});

const ActivityUpdatedPayloadSchema = z.object({
  activityId: z.string(),
  patch: ActivityPayloadSchema.partial().extend({
    latitude: z.number().nullish(),
    longitude: z.number().nullish(),
  }),
});

const ActivityDeletedPayloadSchema = z.object({ activityId: z.string() });

const ActivityMovedPayloadSchema = z.object({
  activityId: z.string(),
  fromDayId: z.string(),
  toDayId: z.string(),
  position: z.string(),
});

const DayCreatedPayloadSchema = z.object({
  day: DayPayloadSchema.extend({ position: z.string() }),
});

const DayUpdatedPatchSchema = z.object({ label: z.string().optional() }).strict();

const DayUpdatedPayloadSchema = z.object({
  dayId: z.string(),
  patch: DayUpdatedPatchSchema,
});

const DayRemovedPayloadSchema = z.object({ dayId: z.string() });

const DayReorderedPayloadSchema = z.object({ dayId: z.string(), position: z.string() });

const EventInsertBaseSchema = z.object({
  id: z.string().min(1),
  planId: z.string().min(1),
  actorId: z.string().nullish(),
});

export const EventInsertSchema = z.discriminatedUnion("type", [
  EventInsertBaseSchema.extend({
    type: z.literal("activity.created"),
    payload: ActivityCreatedPayloadSchema,
  }),
  EventInsertBaseSchema.extend({
    type: z.literal("activity.updated"),
    payload: ActivityUpdatedPayloadSchema,
  }),
  EventInsertBaseSchema.extend({
    type: z.literal("activity.deleted"),
    payload: ActivityDeletedPayloadSchema,
  }),
  EventInsertBaseSchema.extend({
    type: z.literal("activity.moved"),
    payload: ActivityMovedPayloadSchema,
  }),
  EventInsertBaseSchema.extend({
    type: z.literal("day.created"),
    payload: DayCreatedPayloadSchema,
  }),
  EventInsertBaseSchema.extend({
    type: z.literal("day.updated"),
    payload: DayUpdatedPayloadSchema,
  }),
  EventInsertBaseSchema.extend({
    type: z.literal("day.removed"),
    payload: DayRemovedPayloadSchema,
  }),
  EventInsertBaseSchema.extend({
    type: z.literal("day.reordered"),
    payload: DayReorderedPayloadSchema,
  }),
]) satisfies z.ZodType<EventInsert>;

const StoredEventBaseSchema = z.object({
  event_id: z.string(),
  plan_id: z.string(),
  version: z.number().positive(),
  created_at: z.string(),
  actor_id: z.string().nullish(),
});

export const StoredEventSchema = z.discriminatedUnion("event_type", [
  StoredEventBaseSchema.extend({
    event_type: z.literal("activity.created"),
    payload: ActivityCreatedPayloadSchema,
  }),
  StoredEventBaseSchema.extend({
    event_type: z.literal("activity.updated"),
    payload: ActivityUpdatedPayloadSchema,
  }),
  StoredEventBaseSchema.extend({
    event_type: z.literal("activity.deleted"),
    payload: ActivityDeletedPayloadSchema,
  }),
  StoredEventBaseSchema.extend({
    event_type: z.literal("activity.moved"),
    payload: ActivityMovedPayloadSchema,
  }),
  StoredEventBaseSchema.extend({
    event_type: z.literal("day.created"),
    payload: DayCreatedPayloadSchema,
  }),
  StoredEventBaseSchema.extend({
    event_type: z.literal("day.updated"),
    payload: DayUpdatedPayloadSchema,
  }),
  StoredEventBaseSchema.extend({
    event_type: z.literal("day.removed"),
    payload: DayRemovedPayloadSchema,
  }),
  StoredEventBaseSchema.extend({
    event_type: z.literal("day.reordered"),
    payload: DayReorderedPayloadSchema,
  }),
]);

export type StoredEvent = z.infer<typeof StoredEventSchema>;

export const AppendEventsResponseSchema = z.object({
  version: z.number(),
  inserted_events: z.array(StoredEventSchema),
});

export function mapEvent(row: StoredEvent): EventRecord {
  const base = {
    id: row.event_id,
    planId: row.plan_id,
    version: row.version,
    createdAt: row.created_at,
    actorId: row.actor_id ?? undefined,
  };
  switch (row.event_type) {
    case "activity.created":
      return { ...base, type: row.event_type, payload: row.payload };
    case "activity.updated":
      return { ...base, type: row.event_type, payload: row.payload };
    case "activity.deleted":
      return { ...base, type: row.event_type, payload: row.payload };
    case "activity.moved":
      return { ...base, type: row.event_type, payload: row.payload };
    case "day.created":
      return { ...base, type: row.event_type, payload: row.payload };
    case "day.updated":
      return { ...base, type: row.event_type, payload: row.payload };
    case "day.removed":
      return { ...base, type: row.event_type, payload: row.payload };
    case "day.reordered":
      return { ...base, type: row.event_type, payload: row.payload };
  }
}
