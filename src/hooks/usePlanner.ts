// src/hooks/usePlanner.ts
'use client';
import { useEffect } from 'react';
import { closestCenter } from '@dnd-kit/core';

import {
  useTripRange,
  useCatalog,
  useDnDPlanner,
  usePlanParams,
  usePlanDaysStorage,
} from '@/hooks';
import { buildInitialDays, syncDaysWithTripRange } from '@/utils';
import type { DayPlan } from '@/types';

export function usePlanner(enabled: boolean) {
  /* Plan id + destination from URL */
  const { dest, planId } = usePlanParams();

  const { tripDays, currentRange, handleRangeChange } = useTripRange(dest, planId);
  const { isLoading, error } = useCatalog(dest, { enabled });

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
  } = useDnDPlanner(buildInitialDays(tripDays));

  usePlanDaysStorage(planId, days, setDays);

  /* Sync on range change */
  useEffect(() => {
    setDays((prevDays: DayPlan[]) => syncDaysWithTripRange(prevDays, tripDays));
  }, [tripDays, setDays]);

  return {
    planId,
    dest,
    days,
    setDays,
    tripDays,
    currentRange,
    isLoading,
    error,
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
