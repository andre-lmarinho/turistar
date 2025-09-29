// src/features/planner/hooks/useDragState.ts
'use client';

import { useState, useRef, useEffect, useCallback, type SetStateAction } from 'react';
import {
  PointerSensor,
  TouchSensor,
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
    const dstDayIdx = dayIndexMap.get(String(sortable.containerId));
    if (dstDayIdx == null) return null;
    return {
      dstDayIdx,
      newIndex: sortable.index,
    };
  }

  const dayIdx = dayIndexMap.get(String(over.id));
  if (dayIdx != null) {
    return { dstDayIdx: dayIdx, newIndex: days[dayIdx].activities.length };
  }

  const activityMeta = activityIndexMap.get(String(over.id));
  if (!activityMeta) return null;

  return {
    dstDayIdx: activityMeta.dayIdx,
    newIndex: activityMeta.actIdx,
  };
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
          daysRef.current = prevDays;
          rebuildCaches(prevDays);
          return prevDays;
        }

        daysRef.current = nextDays;
        rebuildCaches(nextDays);
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
  // Throttle state updates so drag-over doesn't fire excessively
  const lastTimeRef = useRef<number>(0);

  const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 8 } });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 0, tolerance: 4 },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

  const lastOverRef = useRef<DragOverEvent['over'] | null>(null);

  function handleDragStart(e: DragStartEvent): void {
    setActiveId(e.active.id);
    lastTimeRef.current = 0;
    lastOverRef.current = null;
  }

  const applyDragUpdate = useCallback(
    (activeId: UniqueIdentifier, over: DragOverEvent['over'] | null) => {
      if (!over) return;

      setDays((prevDays) => {
        const sourceMeta = activityIndexRef.current.get(String(activeId));
        if (!sourceMeta) return prevDays;

        const target = getDragTarget(prevDays, over, dayIndexRef.current, activityIndexRef.current);
        if (!target) return prevDays;

        const { dayIdx: srcDayIdx, actIdx: oldIndex } = sourceMeta;
        const { dstDayIdx, newIndex } = target;

        if (dstDayIdx === srcDayIdx && newIndex === oldIndex) {
          return prevDays;
        }

        const nextDays = [...prevDays];
        const srcDay = prevDays[srcDayIdx];
        const dstDay = prevDays[dstDayIdx];
        if (!srcDay || !dstDay) return prevDays;

        nextDays[srcDayIdx] = {
          ...srcDay,
          activities: [...srcDay.activities],
        };
        const srcActivities = nextDays[srcDayIdx].activities;
        const [moved] = srcActivities.splice(oldIndex, 1);
        if (!moved) return prevDays;

        let dstActivities = srcActivities;
        if (dstDayIdx !== srcDayIdx) {
          nextDays[dstDayIdx] = {
            ...dstDay,
            activities: [...dstDay.activities],
          };
          dstActivities = nextDays[dstDayIdx].activities;
        }

        dstActivities.splice(newIndex, 0, moved);

        lastOverRef.current = over;

        return nextDays;
      });
    },
    [setDays]
  );

  function handleDragOver(e: DragOverEvent): void {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    lastOverRef.current = over;
    const now = Date.now();
    // Avoid rapid re-renders but keep drag responsive
    if (now - lastTimeRef.current < 16) return;
    lastTimeRef.current = now;

    applyDragUpdate(active.id, over);
  }

  function handleDragEnd(e?: DragEndEvent): void {
    const active = e?.active;
    const over = e?.over ?? lastOverRef.current;
    if (active && over && active.id !== over.id) {
      applyDragUpdate(active.id, over);
    }
    setActiveId(null);
    lastOverRef.current = null;
  }

  return {
    days,
    setDays,
    getDaysSnapshot: () => daysRef.current,
    activeId,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
