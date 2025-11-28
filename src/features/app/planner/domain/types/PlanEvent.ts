import type { Activity, DayPlan } from './PlannerEntities';

export type PlanEventType =
  | 'activity.created'
  | 'activity.updated'
  | 'activity.deleted'
  | 'activity.moved'
  | 'day.created'
  | 'day.updated'
  | 'day.removed'
  | 'day.reordered';

export interface PlanEventBase<TType extends PlanEventType, TPayload> {
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

export type PlanEvent =
  | PlanEventBase<'activity.created', ActivityCreatedPayload>
  | PlanEventBase<'activity.updated', ActivityUpdatedPayload>
  | PlanEventBase<'activity.deleted', ActivityDeletedPayload>
  | PlanEventBase<'activity.moved', ActivityMovedPayload>
  | PlanEventBase<'day.created', DayCreatedPayload>
  | PlanEventBase<'day.updated', DayUpdatedPayload>
  | PlanEventBase<'day.removed', DayRemovedPayload>
  | PlanEventBase<'day.reordered', DayReorderedPayload>;

export type PlanEventInsert = Omit<PlanEvent, 'version' | 'createdAt'>;

export interface PlanSnapshot {
  version: number;
  days: DayPlan[];
  updatedAt: string;
}

export interface PlanState {
  version: number;
  days: DayPlan[];
}
