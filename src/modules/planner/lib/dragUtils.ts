import type { CollisionDetection, DragOverEvent } from "@dnd-kit/core";
import { closestCenter, pointerWithin } from "@dnd-kit/core";
import type { DayPlan } from "@/features/activity/types";

export interface DragTarget {
  dayIndex: number;
  activityIndex: number;
}

/**
 * Build index maps for fast lookups during drag operations.
 */
export function buildIndexMaps(days: DayPlan[]) {
  const dayMap = new Map<string, number>();
  const activityMap = new Map<string, { dayIdx: number; actIdx: number }>();

  days.forEach((day, dayIdx) => {
    dayMap.set(day.id, dayIdx);
    day.activities.forEach((activity, actIdx) => {
      activityMap.set(activity.id, { dayIdx, actIdx });
    });
  });

  return { dayMap, activityMap };
}

/**
 * Determine the drag target from a drag-over event.
 */
export function getDragTarget(
  days: DayPlan[],
  over: DragOverEvent["over"],
  dayMap: Map<string, number>,
  activityMap: Map<string, { dayIdx: number; actIdx: number }>
): DragTarget | null {
  if (!over) return null;

  // Check if over a sortable item
  const sortable = over.data?.current?.sortable;
  if (sortable) {
    const dayIndex = dayMap.get(String(sortable.containerId));
    if (dayIndex !== undefined) {
      return { dayIndex, activityIndex: sortable.index };
    }
  }

  // Check if over a day column
  const dayIndex = dayMap.get(String(over.id));
  if (dayIndex !== undefined) {
    return { dayIndex, activityIndex: days[dayIndex].activities.length };
  }

  // Check if over an activity
  const activityMeta = activityMap.get(String(over.id));
  if (activityMeta) {
    return { dayIndex: activityMeta.dayIdx, activityIndex: activityMeta.actIdx };
  }

  return null;
}

/**
 * Collision detection that prefers the container the pointer is over,
 * then falls back to closest-center among sortables in that container.
 */
export const containerCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) {
    const containerId = pointerCollisions[0].id;
    const centerCollisions = closestCenter(args);
    const sortablesInContainer = centerCollisions.filter(
      (collision) => collision.data?.droppableContainer?.data?.current?.sortable?.containerId === containerId
    );
    return sortablesInContainer.length > 0 ? sortablesInContainer : pointerCollisions;
  }
  return closestCenter(args);
};
