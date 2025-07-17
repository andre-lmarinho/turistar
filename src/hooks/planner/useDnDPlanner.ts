// src/hooks/planner/useDnDPlanner.ts
'use client';

import type { DayPlan } from '@/types';
import { useDragState, useActivityState } from '@/hooks';

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
