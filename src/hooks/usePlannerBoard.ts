// src/hooks/usePlannerBoard.ts
'use client';

import { closestCenter } from '@dnd-kit/core';
import { useDnDPlanner } from '@/hooks';
import type { DayPlan } from '@/types';

/**
 * Encapsulates drag-and-drop state and handlers.
 * Returns both the “official” days and the preview copy while dragging.
 */
export function usePlannerBoard(initialDays: DayPlan[]) {
  const {
    days,
    setDays,
    activeId,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    addActivity,
    removeActivity,
    updateActivity,
    addBlankActivity,
  } = useDnDPlanner(initialDays);

  return {
    days,
    setDays,
    activeId,
    sensors,
    collisionDetection: closestCenter,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    addActivity,
    removeActivity,
    updateActivity,
    addBlankActivity,
  };
}
