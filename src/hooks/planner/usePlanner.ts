// src/hooks/usePlanner.ts
'use client';

import { useMemo } from 'react';
import { closestCenter } from '@dnd-kit/core';
import { DateRange } from 'react-day-picker';
import { eachDayOfInterval } from 'date-fns';

import { useTripRange, useDnDPlanner, usePlanParams } from '@/hooks';
import { buildInitialDays, syncDaysWithTripRange } from '@/utils';
import { setPlanDateRange } from '@/app/planner/actions/updatePlan';
import type { DayPlan } from '@/types';

interface UsePlannerOptions {
  initialDays?: DayPlan[];
  planId?: string;
  dest?: string;
  persistDays?: { mutate: (state: DayPlan[]) => void };
}
export function usePlanner(options: UsePlannerOptions = {}) {
  const { dest: urlDest, destCoords } = usePlanParams();
  const dest = options.dest ?? urlDest;
  const planId = options.planId ?? '';

  const {
    tripDays,
    currentRange,
    handleRangeChange: setRange,
  } = useTripRange(options.initialDays ?? []);

  /* DnD state */
  const initialDnDDays = useMemo(
    () =>
      options.initialDays && options.initialDays.length > 0
        ? options.initialDays
        : buildInitialDays(tripDays),
    [options.initialDays, tripDays]
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

  function handleRangeChange(r: DateRange | undefined) {
    setRange(r);
    if (!r?.from || !r?.to) return;
    if (options.planId) {
      setPlanDateRange(options.planId, r.from, r.to);
    }
    const newTripDays = eachDayOfInterval({ start: r.from, end: r.to });
    setDays((prev: DayPlan[]) => {
      const updated = syncDaysWithTripRange(prev, newTripDays);
      options.persistDays?.mutate(updated);
      return updated;
    });
  }

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
