import type { Activity, DayPlan } from "@/features/activity/types";

export type EventType =
  | "activity.created"
  | "activity.updated"
  | "activity.deleted"
  | "activity.moved"
  | "day.created"
  | "day.updated"
  | "day.removed"
  | "day.reordered";

export interface EventBase<TType extends EventType, TPayload> {
  id: string;
  planId: string;
  version: number;
  type: TType;
  payload: TPayload;
  createdAt: string;
  actorId?: string | null;
}

export interface ActivityCreatedPayload {
  dayId: string;
  activity: Activity;
  position: string;
}

export interface ActivityUpdatedPayload {
  activityId: string;
  patch: Partial<Activity>;
}

export interface ActivityDeletedPayload {
  activityId: string;
}

export interface ActivityMovedPayload {
  activityId: string;
  fromDayId: string;
  toDayId: string;
  position: string;
}

export interface DayCreatedPayload {
  day: DayPlan & { position: string };
}

export interface DayUpdatedPayload {
  dayId: string;
  patch: Partial<DayPlan>;
}

export interface DayRemovedPayload {
  dayId: string;
}

export interface DayReorderedPayload {
  dayId: string;
  position: string;
}

export type EventRecord =
  | EventBase<"activity.created", ActivityCreatedPayload>
  | EventBase<"activity.updated", ActivityUpdatedPayload>
  | EventBase<"activity.deleted", ActivityDeletedPayload>
  | EventBase<"activity.moved", ActivityMovedPayload>
  | EventBase<"day.created", DayCreatedPayload>
  | EventBase<"day.updated", DayUpdatedPayload>
  | EventBase<"day.removed", DayRemovedPayload>
  | EventBase<"day.reordered", DayReorderedPayload>;

type EventInsertForRecord<TRecord extends EventRecord> = Omit<TRecord, "version" | "createdAt">;

export type EventInsert = EventRecord extends infer TRecord
  ? TRecord extends EventRecord
    ? EventInsertForRecord<TRecord>
    : never
  : never;

export interface EventState {
  version: number;
  days: DayPlan[];
}
