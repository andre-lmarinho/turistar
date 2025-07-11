// src/hooks/usePlannerBoard.ts
'use client';

import { closestCenter } from '@dnd-kit/core';

import { useDnDPlanner } from '@/hooks';
import type { DayPlan } from '@/types';

/**
 * Encapsulates drag-and-drop and activity state logic for the planner board.
 * - Accepts initial day data
 * - Manages sorting, sensors, and activity manipulation
 * - Keeps DnD logic separated from URL/date logic in usePlanner
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
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    addActivity,
    removeActivity,
    updateActivity,
    addBlankActivity,
    collisionDetection: closestCenter,
  };
}
