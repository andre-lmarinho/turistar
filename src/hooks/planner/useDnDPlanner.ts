// src/hooks/planner/useDnDPlanner.ts
'use client';

import type { DayPlan } from '@/types';
import { useDragState, useActivityState } from '@/hooks';

/**
 * Combines drag state and activity helpers for the planner.
 * - Initializes drag-and-drop from the provided days.
 * - Returns sensors and handlers for dnd operations.
 */

export function useDnDPlanner(initialDays: DayPlan[]) {
  const { days, setDays, activeId, sensors, handleDragStart, handleDragOver, handleDragEnd } =
    useDragState(initialDays);

  const { addActivity, removeActivity, updateActivity, addBlankActivity } =
    useActivityState(setDays);

  return {
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
  };
}
