// src/features/planner/hooks/useDragState.ts
'use client';

import { useState, useRef, useEffect } from 'react';
import {
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import type { DayPlan } from '@/shared/types';

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
  over: DragOverEvent['over']
): { dstDayIdx: number; newIndex: number } | null {
  if (!over) return null;

  const sortable = over.data?.current?.sortable;
  if (sortable) {
    return {
      dstDayIdx: days.findIndex((d) => d.id === String(sortable.containerId)),
      newIndex: sortable.index,
    };
  }

  let dstDayIdx = days.findIndex((d) => d.id === over.id);
  if (dstDayIdx < 0) {
    dstDayIdx = days.findIndex((d) => d.activities.some((a) => a.id === over.id));
    if (dstDayIdx < 0) return null;
    return {
      dstDayIdx,
      newIndex: days[dstDayIdx].activities.findIndex((a) => a.id === over.id),
    };
  }

  return { dstDayIdx, newIndex: days[dstDayIdx].activities.length };
}

export function useDragState(initialDays: DayPlan[]) {
  const [days, setDays] = useState<DayPlan[]>(initialDays);
  useEffect(() => {
    if (!initialDays.length) return;
    setDays(initialDays);
  }, [initialDays]);

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  // Throttle state updates so drag-over doesn't fire excessively
  const lastTimeRef = useRef<number>(0);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function handleDragStart(e: DragStartEvent): void {
    setActiveId(e.active.id);
    lastTimeRef.current = 0;
  }

  function handleDragOver(e: DragOverEvent): void {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const now = Date.now();
    // Avoid rapid re-renders by only updating every 50ms
    if (now - lastTimeRef.current < 50) return;
    lastTimeRef.current = now;

    setDays((prevDays) => {
      const updated = prevDays.map((d) => ({ ...d, activities: [...d.activities] }));

      // Source indices: find the day and position of the dragged item
      const srcDayIdx = updated.findIndex((d) => d.activities.some((a) => a.id === active.id));
      if (srcDayIdx < 0) return prevDays;
      const srcActs = updated[srcDayIdx].activities;
      const oldIndex = srcActs.findIndex((a) => a.id === active.id);

      // Destination indices: resolve where the item should be inserted
      const target = getDragTarget(updated, over);
      if (!target) return prevDays;
      const { dstDayIdx, newIndex } = target;

      if (dstDayIdx === srcDayIdx && newIndex === oldIndex) {
        return prevDays;
      }

      const dstActs = dstDayIdx === srcDayIdx ? srcActs : updated[dstDayIdx].activities;

      const [moved] = srcActs.splice(oldIndex, 1);
      dstActs.splice(newIndex, 0, moved);

      updated[srcDayIdx].activities = srcActs;
      updated[dstDayIdx].activities = dstActs;

      return updated;
    });
  }

  function handleDragEnd(): void {
    setActiveId(null);
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
