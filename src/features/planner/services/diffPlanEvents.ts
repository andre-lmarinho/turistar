// src/features/planner/services/diffPlanEvents.ts

import { midpoint } from '@/features/planner/domain/events/gapOrdering';
import type { Activity, DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import { isPlaceholderActivity } from '@/features/planner/domain/utils/activityPlaceholders';
import type { PlanEventInsert } from '@/features/planner/domain/types/PlanEvent';

function generateId(): string {
  const crypto = globalThis.crypto;
  if (crypto?.randomUUID) return crypto.randomUUID();
  return `evt-${Math.random().toString(36).slice(2, 10)}`;
}

function cloneActivity(activity: Activity): Activity {
  return { ...activity };
}

function ensureTitle(title: string | undefined, fallback: string): string {
  const trimmed = title?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function sanitizeActivity(activity: Activity): Activity {
  const { latitude, longitude, ...base } = {
    ...activity,
    title: ensureTitle(activity.title, 'Untitled activity'),
  };

  return {
    ...base,
    ...(isFiniteNumber(latitude) ? { latitude } : {}),
    ...(isFiniteNumber(longitude) ? { longitude } : {}),
  };
}

function ensurePositions<T extends { position?: string }>(items: T[]): T[] {
  let needsClone = false;
  const result: T[] = items.map((item, index) => {
    if (item.position != null && item.position !== '') return item;
    needsClone = true;
    return { ...item, position: String((index + 1) * 1024) };
  });
  return needsClone ? result : items;
}

function toNumber(position?: string): number | null {
  if (position == null) return null;
  const num = Number(position);
  return Number.isFinite(num) ? num : null;
}

function isBetween(position: string | undefined, left?: string, right?: string): boolean {
  const value = toNumber(position);
  if (value == null) return false;

  const leftNum = toNumber(left);
  const rightNum = toNumber(right);
  const effectiveRight =
    rightNum == null || (leftNum != null && leftNum >= rightNum) ? null : rightNum;

  if (leftNum != null && value <= leftNum) return false;
  if (effectiveRight != null && value >= effectiveRight) return false;
  return true;
}

function activityEquals(a: Activity, b: Activity): boolean {
  return (
    ensureTitle(a.title, '') === ensureTitle(b.title, '') &&
    (a.description ?? '') === (b.description ?? '') &&
    (a.address ?? '') === (b.address ?? '') &&
    (a.duration ?? 0) === (b.duration ?? 0) &&
    (a.startTime ?? '') === (b.startTime ?? '') &&
    (a.imageUrl ?? '') === (b.imageUrl ?? '') &&
    (a.budget ?? 0) === (b.budget ?? 0) &&
    (a.category ?? '') === (b.category ?? '') &&
    (a.latitude ?? 0) === (b.latitude ?? 0) &&
    (a.longitude ?? 0) === (b.longitude ?? 0) &&
    (a.color ?? '') === (b.color ?? '')
  );
}

function computeRightNeighborPosition(
  orderedIds: string[],
  index: number,
  positionMap: Map<string, string | undefined>
): string | undefined {
  for (let i = index + 1; i < orderedIds.length; i++) {
    const pos = positionMap.get(orderedIds[i]);
    if (pos) return pos;
  }
  return undefined;
}

export function diffPlanEvents(
  planId: string,
  previousDays: DayPlan[],
  nextDays: DayPlan[],
  actorId?: string | null
): PlanEventInsert[] {
  const events: PlanEventInsert[] = [];
  const prevDaysWithPositions = ensurePositions(previousDays);
  const prevDayMap = new Map(prevDaysWithPositions.map((day) => [day.id, day]));
  const prevActivityMap = new Map<string, { dayId: string; activity: Activity }>();

  for (const day of prevDaysWithPositions) {
    for (const activity of ensurePositions(day.activities)) {
      if (isPlaceholderActivity(activity)) continue;
      prevActivityMap.set(activity.id, { dayId: day.id, activity });
    }
  }

  const nextDayIds = new Set(nextDays.map((day) => day.id));
  for (const day of prevDaysWithPositions) {
    if (!nextDayIds.has(day.id)) {
      events.push({
        id: generateId(),
        planId,
        type: 'day.removed',
        payload: { dayId: day.id },
        actorId: actorId ?? undefined,
      });
    }
  }

  const resolvedDayPositions = new Map<string, string>();
  const nextDaysWithPositions = nextDays.map((day) => ({
    ...day,
    activities: ensurePositions(day.activities).map(cloneActivity),
  }));

  const nextActivityMap = new Map<string, { dayId: string; activity: Activity }>();
  for (const day of nextDaysWithPositions) {
    for (const activity of day.activities) {
      if (isPlaceholderActivity(activity)) continue;
      nextActivityMap.set(activity.id, { dayId: day.id, activity });
    }
  }

  for (let index = 0; index < nextDaysWithPositions.length; index++) {
    const day = nextDaysWithPositions[index];
    const prev = prevDayMap.get(day.id);
    const leftId = index > 0 ? nextDaysWithPositions[index - 1].id : undefined;
    const leftPos = leftId
      ? (resolvedDayPositions.get(leftId) ?? prevDayMap.get(leftId)?.position)
      : undefined;
    const rightPos = (() => {
      for (let i = index + 1; i < nextDaysWithPositions.length; i++) {
        const candidateId = nextDaysWithPositions[i].id;
        const resolved = resolvedDayPositions.get(candidateId);
        if (resolved) return resolved;
        const prevCandidate = prevDayMap.get(candidateId);
        if (prevCandidate?.position) return prevCandidate.position;
      }
      return undefined;
    })();

    let position = prev?.position;
    if (!isBetween(position, leftPos, rightPos)) {
      position = midpoint(leftPos, rightPos);
    }
    resolvedDayPositions.set(day.id, position ?? midpoint(leftPos, rightPos));

    if (!prev) {
      events.push({
        id: generateId(),
        planId,
        type: 'day.created',
        payload: {
          day: {
            id: day.id,
            label: day.label,
            position: resolvedDayPositions.get(day.id)!,
            activities: day.activities.map((activity) => ({
              ...sanitizeActivity(activity),
              position: activity.position ?? midpoint(undefined, undefined),
            })),
          },
        },
        actorId: actorId ?? undefined,
      });
      continue;
    }

    if (prev.label !== day.label) {
      events.push({
        id: generateId(),
        planId,
        type: 'day.updated',
        payload: { dayId: day.id, patch: { label: day.label } },
        actorId: actorId ?? undefined,
      });
    }

    if (prev.position !== resolvedDayPositions.get(day.id)) {
      events.push({
        id: generateId(),
        planId,
        type: 'day.reordered',
        payload: { dayId: day.id, position: resolvedDayPositions.get(day.id)! },
        actorId: actorId ?? undefined,
      });
    }
  }

  // Activity diffing
  for (const day of nextDaysWithPositions) {
    const prevDay = prevDayMap.get(day.id);
    const visibleActivities = day.activities.filter((activity) => !isPlaceholderActivity(activity));

    if (prevDay) {
      for (const activity of prevDay.activities) {
        if (isPlaceholderActivity(activity)) continue;
        if (!nextActivityMap.has(activity.id)) {
          events.push({
            id: generateId(),
            planId,
            type: 'activity.deleted',
            payload: { activityId: activity.id },
            actorId: actorId ?? undefined,
          });
        }
      }
    }

    const activityOrder = visibleActivities.map((a) => a.id);
    const neighborPositionMap = new Map(visibleActivities.map((a) => [a.id, a.position]));

    visibleActivities.forEach((activity, index) => {
      const prevActivity = prevActivityMap.get(activity.id);
      if (!prevActivity) {
        const position = midpoint(
          index > 0 ? neighborPositionMap.get(activityOrder[index - 1]) : undefined,
          computeRightNeighborPosition(activityOrder, index, neighborPositionMap)
        );
        events.push({
          id: generateId(),
          planId,
          type: 'activity.created',
          payload: {
            dayId: day.id,
            activity: {
              ...sanitizeActivity(activity),
              id: activity.id,
              position,
            },
            position,
          },
          actorId: actorId ?? undefined,
        });
        return;
      }

      const prevDayId = prevActivity.dayId;
      const prevPos = prevActivity.activity.position;
      const leftPos = index > 0 ? neighborPositionMap.get(activityOrder[index - 1]) : undefined;
      const rightPos = computeRightNeighborPosition(activityOrder, index, neighborPositionMap);
      let position = prevPos;
      if (!isBetween(position, leftPos, rightPos) || day.id !== prevDayId) {
        position = midpoint(leftPos, rightPos);
        events.push({
          id: generateId(),
          planId,
          type: 'activity.moved',
          payload: {
            activityId: activity.id,
            fromDayId: prevDayId,
            toDayId: day.id,
            position,
          },
          actorId: actorId ?? undefined,
        });
      }

      if (!activityEquals(activity, prevActivity.activity)) {
        const patch: Partial<Activity> = sanitizeActivity(activity);
        delete patch.position;
        events.push({
          id: generateId(),
          planId,
          type: 'activity.updated',
          payload: {
            activityId: activity.id,
            patch,
          },
          actorId: actorId ?? undefined,
        });
      }
    });
  }

  return events;
}
