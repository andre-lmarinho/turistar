// src/features/planner/hooks/useDragState.ts
'use client';

import { useState, useRef, useEffect, useCallback, type SetStateAction } from 'react';
import {
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragMoveEvent,
  type DragEndEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
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
  const lastAppliedRef = useRef<{
    activeId: UniqueIdentifier;
    overId: UniqueIdentifier | null;
  } | null>(null);
  const queuedFrameRef = useRef<number | null>(null);
  const queuedEventRef = useRef<{ activeId: UniqueIdentifier; over: DragOverEvent['over'] } | null>(
    null
  );

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

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function reorderActivities(
    prevDays: DayPlan[],
    activeIdValue: UniqueIdentifier,
    over: DragOverEvent['over']
  ): { nextDays: DayPlan[]; didUpdate: boolean } {
    if (!over) {
      return { nextDays: prevDays, didUpdate: false };
    }

    const sourceMeta = activityIndexRef.current.get(String(activeIdValue));
    if (!sourceMeta) {
      return { nextDays: prevDays, didUpdate: false };
    }

    const target = getDragTarget(prevDays, over, dayIndexRef.current, activityIndexRef.current);
    if (!target) {
      return { nextDays: prevDays, didUpdate: false };
    }

    const { dayIdx: srcDayIdx, actIdx: oldIndex } = sourceMeta;
    const { dstDayIdx, newIndex } = target;

    const srcDay = prevDays[srcDayIdx];
    const dstDay = prevDays[dstDayIdx];
    if (!srcDay || !dstDay) {
      return { nextDays: prevDays, didUpdate: false };
    }

    if (dstDayIdx === srcDayIdx) {
      if (newIndex === oldIndex) {
        return { nextDays: prevDays, didUpdate: false };
      }

      const nextDays = [...prevDays];
      nextDays[srcDayIdx] = {
        ...srcDay,
        activities: arrayMove(srcDay.activities, oldIndex, newIndex),
      };
      return { nextDays, didUpdate: true };
    }

    const nextDays = [...prevDays];
    nextDays[srcDayIdx] = {
      ...srcDay,
      activities: [...srcDay.activities],
    };
    const srcActivities = nextDays[srcDayIdx].activities;
    const [moved] = srcActivities.splice(oldIndex, 1);
    if (!moved) {
      return { nextDays: prevDays, didUpdate: false };
    }

    nextDays[dstDayIdx] = {
      ...dstDay,
      activities: [...dstDay.activities],
    };
    const dstActivities = nextDays[dstDayIdx].activities;
    dstActivities.splice(newIndex, 0, moved);

    return { nextDays, didUpdate: true };
  }

  function handleDragStart(e: DragStartEvent): void {
    setActiveId(e.active.id);
    lastAppliedRef.current = null;
    if (queuedFrameRef.current != null) {
      if (typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function') {
        window.cancelAnimationFrame(queuedFrameRef.current);
      }
      queuedFrameRef.current = null;
    }
    queuedEventRef.current = null;
  }

  const applyDragUpdate = useCallback(
    (
      activeIdValue: UniqueIdentifier,
      over: DragOverEvent['over'],
      onApply?: (nextDays: DayPlan[]) => void
    ): boolean => {
      if (!over) return false;

      let didUpdate = false;
      let appliedDays: DayPlan[] | null = null;

      setDays((prevDays) => {
        const { nextDays, didUpdate: wasUpdated } = reorderActivities(prevDays, activeIdValue, over);
        didUpdate = wasUpdated;
        appliedDays = nextDays;
        return nextDays;
      });

      lastAppliedRef.current = { activeId: activeIdValue, overId: over.id ?? null };

      if (didUpdate && appliedDays && onApply) {
        onApply(appliedDays);
      }

      return didUpdate;
    },
    [setDays]
  );

  const scheduleDragUpdate = useCallback(
    (activeIdValue: UniqueIdentifier, over: DragOverEvent['over']) => {
      if (!over) return;

      const lastApplied = lastAppliedRef.current;
      const overId = over.id ?? null;
      if (!queuedFrameRef.current) {
        if (
          lastApplied &&
          lastApplied.activeId === activeIdValue &&
          lastApplied.overId === overId
        ) {
          return;
        }

        applyDragUpdate(activeIdValue, over);

        queuedFrameRef.current =
          typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function'
            ? window.requestAnimationFrame(() => {
                queuedFrameRef.current = null;
                const nextEvent = queuedEventRef.current;
                queuedEventRef.current = null;
                if (!nextEvent) return;
                applyDragUpdate(nextEvent.activeId, nextEvent.over);
              })
            : window.setTimeout(() => {
                queuedFrameRef.current = null;
                const nextEvent = queuedEventRef.current;
                queuedEventRef.current = null;
                if (!nextEvent) return;
                applyDragUpdate(nextEvent.activeId, nextEvent.over);
              }, 16);

        return;
      }

      queuedEventRef.current = { activeId: activeIdValue, over };
    },
    [applyDragUpdate]
  );

  function handleDragMove(e: DragMoveEvent): void {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    scheduleDragUpdate(active.id, over);
  }

  function handleDragOver(e: DragOverEvent): void {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    scheduleDragUpdate(active.id, over);
  }

  function handleDragEnd(e: DragEndEvent, onApply?: (nextDays: DayPlan[]) => void): void {
    const { active, over } = e;

    if (over && active.id !== over.id) {
      const overId = over.id ?? null;
      const lastApplied = lastAppliedRef.current;

      if (!lastApplied || lastApplied.activeId !== active.id || lastApplied.overId !== overId) {
        const updated = applyDragUpdate(active.id, over, onApply);
        if (!updated && onApply) {
          onApply(daysRef.current);
        }
      } else if (onApply) {
        onApply(daysRef.current);
      }
    } else if (onApply) {
      onApply(daysRef.current);
    }

    setActiveId(null);
    if (queuedFrameRef.current != null) {
      if (typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function') {
        window.cancelAnimationFrame(queuedFrameRef.current);
      } else {
        window.clearTimeout(queuedFrameRef.current);
      }
      queuedFrameRef.current = null;
    }
    queuedEventRef.current = null;
    lastAppliedRef.current = null;
  }

  useEffect(() => {
    return () => {
      if (queuedFrameRef.current != null) {
        if (typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function') {
          window.cancelAnimationFrame(queuedFrameRef.current);
        } else {
          window.clearTimeout(queuedFrameRef.current);
        }
        queuedFrameRef.current = null;
      }
      queuedEventRef.current = null;
    };
  }, []);

  return {
    days,
    setDays,
    activeId,
    sensors,
    handleDragStart,
    handleDragMove,
    handleDragOver,
    handleDragEnd,
  };
}
