'use client';

import type { DayPlan } from '@/features/app/planner/domain/types/PlannerEntities';
import { useDragState } from './useDragState';
import { useActivityState } from './useActivityState';

/**
 * Combines drag state and activity helpers for the planner.
 * - Initializes drag-and-drop from the provided days.
 * - Returns sensors and handlers for dnd operations.
 */

export function useDnDPlanner(initialDays: DayPlan[]) {
  const {
    days,
    setDays,
    getDaysSnapshot,
    activeId,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useDragState(initialDays);

  const {
    addActivity,
    removeActivity,
    updateActivity,
    addBlankActivity,
    insertActivityAt,
    replaceActivity,
  } = useActivityState(setDays);

  return {
    days,
    setDays,
    getDaysSnapshot,
    activeId,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    addActivity,
    removeActivity,
    updateActivity,
    addBlankActivity,
    insertActivityAt,
    replaceActivity,
  };
}
