// src/features/planner/hooks/useDragState.ts
'use client';

import { useState, useRef, useEffect, useCallback, type SetStateAction } from 'react';
import {
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import type { DayPlan } from '@/features/planner/domain/types/PlannerEntities';

/**
 * Handles drag-and-drop interactions for day plans.
 * - Maintains the days array and active drag ID.
 * - Provides sensors and event handlers for use with dnd-kit.
 */

/**
 * Finds the destination day index and insertion index for a drag event.
 */
function getDragTarget(
  days: DayPlan[],
  over: DragOverEvent['over'],
  dayIndexMap: Map<string, number>,
  activityIndexMap: Map<string, { dayIdx: number; actIdx: number }>
): { dstDayIdx: number; newIndex: number } | null {
  if (!over) return null;

  const sortable = over.data?.current?.sortable;
  if (sortable) {
    const containerId = String(sortable.containerId);
    let dstDayIdx = dayIndexMap.get(containerId);
    if (dstDayIdx == null) {
      dstDayIdx = days.findIndex((day) => String(day.id) === containerId);
      if (dstDayIdx === -1) return null;
    }
    return {
      dstDayIdx,
      newIndex: sortable.index,
    };
  }

  const overId = String(over.id);
  let dayIdx = dayIndexMap.get(overId);
  if (dayIdx != null) {
    return { dstDayIdx: dayIdx, newIndex: days[dayIdx].activities.length };
  }

  dayIdx = days.findIndex((day) => String(day.id) === overId);
  if (dayIdx !== -1) {
    return { dstDayIdx: dayIdx, newIndex: days[dayIdx].activities.length };
  }

  let activityMeta = activityIndexMap.get(overId);
  if (!activityMeta) {
    for (let dayIdx = 0; dayIdx < days.length; dayIdx += 1) {
      const actIdx = days[dayIdx].activities.findIndex(
        (activity) => String(activity.id) === overId
      );
      if (actIdx !== -1) {
        activityMeta = { dayIdx, actIdx };
        break;
      }
    }
  }
  if (!activityMeta) return null;

  return {
    dstDayIdx: activityMeta.dayIdx,
    newIndex: activityMeta.actIdx,
  };
}

function moveActivity(
  days: DayPlan[],
  activeId: UniqueIdentifier,
  over: DragOverEvent['over'],
  dayIndexMap: Map<string, number>,
  activityIndexMap: Map<string, { dayIdx: number; actIdx: number }>
): DayPlan[] {
  if (!over) return days;

  const activeKey = String(activeId);
  let sourceMeta = activityIndexMap.get(activeKey);
  if (!sourceMeta) {
    for (let dayIdx = 0; dayIdx < days.length; dayIdx += 1) {
      const actIdx = days[dayIdx].activities.findIndex(
        (activity) => String(activity.id) === activeKey
      );
      if (actIdx !== -1) {
        sourceMeta = { dayIdx, actIdx };
        break;
      }
    }
  }
  if (!sourceMeta) return days;

  const target = getDragTarget(days, over, dayIndexMap, activityIndexMap);
  if (!target) return days;

  const { dayIdx: srcDayIdx, actIdx: oldIndex } = sourceMeta;
  const { dstDayIdx } = target;
  let { newIndex } = target;

  if (dstDayIdx === srcDayIdx && newIndex === oldIndex) {
    return days;
  }

  const nextDays = [...days];
  const srcDay = days[srcDayIdx];
  const dstDay = days[dstDayIdx];
  if (!srcDay || !dstDay) return days;

  nextDays[srcDayIdx] = {
    ...srcDay,
    activities: [...srcDay.activities],
  };
  const srcActivities = nextDays[srcDayIdx].activities;
  const [moved] = srcActivities.splice(oldIndex, 1);
  if (!moved) return days;

  let dstActivities = srcActivities;
  if (dstDayIdx !== srcDayIdx) {
    nextDays[dstDayIdx] = {
      ...dstDay,
      activities: [...dstDay.activities],
    };
    dstActivities = nextDays[dstDayIdx].activities;
  }

  const isSameDay = dstDayIdx === srcDayIdx;
  const overId = over ? String(over.id) : null;
  const isContainerTarget = overId != null && overId === String(dstDay.id);

  if (isSameDay && isContainerTarget && newIndex > oldIndex) {
    newIndex -= 1;
  }

  const clampedIndex = Math.max(0, Math.min(newIndex, dstActivities.length));

  dstActivities.splice(clampedIndex, 0, moved);

  return nextDays;
}

export function useDragState(initialDays: DayPlan[]) {
  const [days, setDaysState] = useState<DayPlan[]>(initialDays);
  const daysRef = useRef<DayPlan[]>(initialDays);

  const dayIndexRef = useRef<Map<string, number>>(new Map());
  const activityIndexRef = useRef<Map<string, { dayIdx: number; actIdx: number }>>(new Map());

  const rebuildCaches = useCallback((sourceDays: DayPlan[]) => {
    const dayIndexMap = dayIndexRef.current;
    const activityIndexMap = activityIndexRef.current;
    dayIndexMap.clear();
    activityIndexMap.clear();

    sourceDays.forEach((day, dayIdx) => {
      dayIndexMap.set(String(day.id), dayIdx);
      day.activities.forEach((activity, actIdx) => {
        activityIndexMap.set(String(activity.id), { dayIdx, actIdx });
      });
    });
  }, []);

  const setDays = useCallback(
    (value: SetStateAction<DayPlan[]>) => {
      setDaysState((prevDays) => {
        const nextDays =
          typeof value === 'function' ? (value as (prev: DayPlan[]) => DayPlan[])(prevDays) : value;

        if (nextDays === prevDays) {
          rebuildCaches(prevDays);
          daysRef.current = prevDays;
          return prevDays;
        }

        rebuildCaches(nextDays);
        daysRef.current = nextDays;
        return nextDays;
      });
    },
    [rebuildCaches]
  );

  useEffect(() => {
    if (!initialDays.length) return;
    setDays(initialDays);
  }, [initialDays, setDays]);

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const lastOverRef = useRef<DragOverEvent['over']>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function handleDragStart(e: DragStartEvent): void {
    setActiveId(e.active.id);
    lastOverRef.current = null;
  }

  function handleDragOver(e: DragOverEvent): void {
    const { active, over } = e;
    if (over) {
      lastOverRef.current = over;
    }
    if (!over || active.id === over.id) return;

    setDays((prevDays) =>
      moveActivity(prevDays, active.id, over, dayIndexRef.current, activityIndexRef.current)
    );
  }

  function handleDragEnd(e: DragEndEvent): DayPlan[] {
    setActiveId(null);

    const { active } = e;
    const over = e.over ?? lastOverRef.current;
    lastOverRef.current = null;

    if (!over || active.id === over.id) {
      return days;
    }

    const currentDays = daysRef.current;
    const updated = moveActivity(
      currentDays,
      active.id,
      over,
      dayIndexRef.current,
      activityIndexRef.current
    );

    if (updated !== currentDays) {
      daysRef.current = updated;
      setDays(updated);
    }

    return updated;
  }

  return {
    days,
    setDays,
    activeId,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
