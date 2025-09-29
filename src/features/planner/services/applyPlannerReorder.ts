// src/features/planner/services/applyPlannerReorder.ts

import type { DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import { cloneDays } from '@/features/planner/services/cloneDays';
import { rankBetween, rebuildRanks } from './rank';

export interface PlannerReorderInput {
  itemId: string;
  fromDayId: string;
  toDayId: string;
  toIndex: number;
}

export interface PlannerReorderResult {
  days: DayPlan[];
  newPosition: string;
}

/**
 * Applies a reorder operation to the provided planner days without mutating the
 * input reference. Returns the new days array plus the optimistic position for
 * the moved activity so cache updates stay in sync with the backend ranking.
 */
export function applyPlannerReorder(
  source: DayPlan[],
  { itemId, fromDayId, toDayId, toIndex }: PlannerReorderInput
): PlannerReorderResult | null {
  const days = cloneDays(source);

  const srcDayIdx = days.findIndex((day) => day.id === fromDayId);
  const dstDayIdx = days.findIndex((day) => day.id === toDayId);
  if (srcDayIdx === -1 || dstDayIdx === -1) {
    return null;
  }

  const srcDay = days[srcDayIdx];
  const dstDay = days[dstDayIdx];
  const srcActivities = [...srcDay.activities];
  const currentIdx = srcActivities.findIndex((activity) => activity.id === itemId);
  if (currentIdx === -1) {
    return null;
  }

  const [moved] = srcActivities.splice(currentIdx, 1);
  if (!moved) return null;

  days[srcDayIdx] = { ...srcDay, activities: srcActivities };

  const dstActivities =
    srcDayIdx === dstDayIdx ? srcActivities : [...dstDay.activities.filter((a) => a.id !== itemId)];

  const insertionIndex = Math.max(0, Math.min(toIndex, dstActivities.length));

  const leftNeighbor = dstActivities[insertionIndex - 1]?.position;
  const rightNeighbor = dstActivities[insertionIndex]?.position;

  const { position, needsRebalance } = rankBetween(leftNeighbor, rightNeighbor);

  dstActivities.splice(insertionIndex, 0, {
    ...moved,
    position,
  });

  let nextPosition = position;

  if (needsRebalance) {
    const updates = rebuildRanks(dstActivities.map((activity) => activity.id));
    dstActivities.forEach((activity) => {
      const updatedPosition = updates.get(activity.id);
      if (updatedPosition) {
        activity.position = updatedPosition;
        if (activity.id === itemId) {
          nextPosition = updatedPosition;
        }
      }
    });
  }

  const patchedDay = {
    ...dstDay,
    activities: dstActivities,
  } satisfies DayPlan;

  days[dstDayIdx] = patchedDay;

  return {
    days,
    newPosition: nextPosition,
  };
}

