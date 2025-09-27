// src/features/planner/domain/events/planEventReducer.ts

import type { Activity, DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import type { PlanEvent, PlanSnapshot, PlanState } from '@/features/planner/domain/types/PlanEvent';

function cloneActivity(activity: Activity): Activity {
  return { ...activity };
}

function cloneDay(day: DayPlan): DayPlan {
  return {
    ...day,
    activities: day.activities.map(cloneActivity),
  };
}

function coerceTitle(title: string | undefined, fallback: string): string {
  const trimmed = title?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

function sanitizeActivity(activity: Activity): Activity {
  const sanitized: Activity = cloneActivity(activity);
  sanitized.title = coerceTitle(activity.title, 'Untitled activity');
  if (!sanitized.color) sanitized.color = 'bg-[var(--color-1)]';
  return sanitized;
}

function ensureDay(
  days: DayPlan[],
  dayId: string,
  label: string
): { days: DayPlan[]; day: DayPlan } {
  const index = days.findIndex((d) => d.id === dayId);
  if (index >= 0) {
    return { days, day: days[index] };
  }

  const next = [...days, { id: dayId, label, activities: [], position: undefined }];
  return { days: next, day: next[next.length - 1] };
}

function insertAt<T>(list: T[], index: number, value: T): T[] {
  const next = [...list];
  if (index < 0 || index > next.length) next.push(value);
  else next.splice(index, 0, value);
  return next;
}

function applySingleEvent(days: DayPlan[], event: PlanEvent): DayPlan[] {
  switch (event.type) {
    case 'activity.created': {
      const { dayId, activity, position } = event.payload;
      const { days: ensuredDays, day } = ensureDay(days.map(cloneDay), dayId, activity.title);
      const sanitized = sanitizeActivity(activity);
      sanitized.position = position;
      const exists = day.activities.find((a) => a.id === sanitized.id);
      if (exists) {
        return ensuredDays;
      }
      day.activities = insertAt(day.activities, day.activities.length, sanitized);
      return ensuredDays;
    }
    case 'activity.updated': {
      const { activityId, patch } = event.payload;
      const nextDays = days.map(cloneDay);
      for (const day of nextDays) {
        const activity = day.activities.find((a) => a.id === activityId);
        if (!activity) continue;
        const updated: Activity = {
          ...activity,
          ...patch,
        };
        updated.title = coerceTitle(updated.title, activity.title);
        Object.assign(activity, updated);
        return nextDays;
      }
      return nextDays;
    }
    case 'activity.deleted': {
      const { activityId } = event.payload;
      return days.map((day) => ({
        ...day,
        activities: day.activities.filter((a) => a.id !== activityId),
      }));
    }
    case 'activity.moved': {
      const { activityId, fromDayId, toDayId, position } = event.payload;
      if (fromDayId === toDayId) {
        const next = days.map(cloneDay);
        const day = next.find((d) => d.id === fromDayId);
        if (!day) return next;
        const activityIndex = day.activities.findIndex((a) => a.id === activityId);
        if (activityIndex === -1) return next;
        const [activity] = day.activities.splice(activityIndex, 1);
        activity.position = position;
        const insertIdx = day.activities.findIndex((a) => a.position && a.position > position);
        if (insertIdx === -1) day.activities.push(activity);
        else day.activities.splice(insertIdx, 0, activity);
        return next;
      }
      const next = days.map(cloneDay);
      const fromDay = next.find((d) => d.id === fromDayId);
      const toDay = next.find((d) => d.id === toDayId);
      if (!fromDay || !toDay) return next;
      const activityIndex = fromDay.activities.findIndex((a) => a.id === activityId);
      if (activityIndex === -1) return next;
      const [activity] = fromDay.activities.splice(activityIndex, 1);
      activity.position = position;
      const insertIdx = toDay.activities.findIndex((a) => a.position && a.position > position);
      if (insertIdx === -1) toDay.activities.push(activity);
      else toDay.activities.splice(insertIdx, 0, activity);
      return next;
    }
    case 'day.created': {
      const { day } = event.payload;
      if (days.some((existing) => existing.id === day.id)) return days;
      const next = days.map(cloneDay);
      const insertIdx = next.findIndex((d) => (d.position ?? '') > day.position);
      const sanitizedDay: DayPlan = {
        id: day.id,
        label: day.label,
        activities: day.activities.map(sanitizeActivity),
        position: day.position,
      };
      if (insertIdx === -1) next.push(sanitizedDay);
      else next.splice(insertIdx, 0, sanitizedDay);
      return next;
    }
    case 'day.updated': {
      const { dayId, patch } = event.payload;
      return days.map((day) =>
        day.id === dayId
          ? {
              ...day,
              ...patch,
              label: patch.label ? patch.label : day.label,
            }
          : day
      );
    }
    case 'day.removed': {
      const { dayId } = event.payload;
      return days.filter((day) => day.id !== dayId);
    }
    case 'day.reordered': {
      const { dayId, position } = event.payload;
      const next = days.map(cloneDay);
      const target = next.find((d) => d.id === dayId);
      if (!target) return next;
      target.position = position;
      next.sort((a, b) => {
        const posA = a.position ?? '';
        const posB = b.position ?? '';
        if (posA === posB) return a.id.localeCompare(b.id);
        return posA < posB ? -1 : 1;
      });
      return next;
    }
    case 'budget.updated': {
      return days;
    }
    default:
      return days;
  }
}

export function reducePlanEvents(snapshot: PlanSnapshot, events: PlanEvent[]): PlanState {
  let state: PlanState = {
    version: snapshot.version,
    days: snapshot.days.map(cloneDay),
  };

  for (const event of events) {
    if (event.version <= state.version) continue;
    state = {
      version: event.version,
      days: applySingleEvent(state.days, event),
    };
  }
  return state;
}

export function applyPlanEvent(days: DayPlan[], event: PlanEvent): DayPlan[] {
  return applySingleEvent(days.map(cloneDay), event);
}
