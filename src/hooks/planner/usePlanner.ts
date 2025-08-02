// src/hooks/usePlanner.ts
'use client';
import { useEffect } from 'react';
import { closestCenter } from '@dnd-kit/core';

import { useTripRange, useDnDPlanner, usePlanParams } from '@/hooks';
import { buildInitialDays, syncDaysWithTripRange } from '@/utils';
import type { DayPlan } from '@/types';

interface UsePlannerOptions {
  initialDays?: DayPlan[];
  planId?: string;
  dest?: string;
}
export function usePlanner(options: UsePlannerOptions = {}) {
  const { dest: urlDest, destCoords } = usePlanParams();
  const dest = options.dest ?? urlDest;
  const planId = options.planId ?? '';

  const { tripDays, currentRange, handleRangeChange } = useTripRange(options.initialDays ?? []);

  /* DnD state */
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
  } = useDnDPlanner(options.initialDays ?? buildInitialDays(tripDays));

  /* Sync on range change */
  useEffect(() => {
    if (!options.initialDays) {
      setDays((prevDays: DayPlan[]) => syncDaysWithTripRange(prevDays, tripDays));
    }
  }, [tripDays, setDays, options.initialDays]);

  return {
    planId,
    dest,
    destCoords,
    days,
    setDays,
    tripDays,
    currentRange,
    activeId,
    sensors,
    collisionDetection: closestCenter,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleRangeChange,
    addActivity,
    removeActivity,
    updateActivity,
    addBlankActivity,
  };
}
