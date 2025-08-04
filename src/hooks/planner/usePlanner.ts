// src/hooks/usePlanner.ts
'use client';
import { useEffect, useMemo } from 'react';
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
  const initialDnDDays = useMemo(
    () =>
      options.initialDays && options.initialDays.length > 0
        ? options.initialDays
        : buildInitialDays(tripDays),
    [options.initialDays] // eslint-disable-line react-hooks/exhaustive-deps
  );

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
  } = useDnDPlanner(initialDnDDays);

  /* Sync on range change */
  useEffect(() => {
    if (tripDays.length === 0) return;
    setDays((prevDays: DayPlan[]) => syncDaysWithTripRange(prevDays, tripDays));
  }, [tripDays, setDays]);

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
