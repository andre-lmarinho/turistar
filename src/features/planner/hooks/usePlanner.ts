// src/features/planner/hooks/usePlanner.ts
'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { pointerWithin } from '@dnd-kit/core';
import { DateRange } from 'react-day-picker';
import { eachDayOfInterval } from 'date-fns';

import { useTripRange } from './useTripRange';
import { useDnDPlanner } from './useDnDPlanner';
import { buildInitialDays } from '@/features/planner/services/initialDays';
import { syncDaysWithTripRange } from '@/features/planner/services/syncDaysWithTripRange';
import { setPlanDateRange } from '@/app/planner/actions/updatePlan';
import type { DayPlan } from '@/shared/types';

interface UsePlannerOptions {
  initialDays?: DayPlan[];
  planId?: string;
  dest?: string;
  persistDays?: { mutate: (state: DayPlan[]) => void };
}
export function usePlanner(options: UsePlannerOptions = {}) {
  const params = useSearchParams();
  const urlDest = params.get('dest')?.trim().toLowerCase() ?? '';
  const latStr = params.get('lat');
  const lngStr = params.get('lng');
  const lat = latStr != null ? Number(latStr) : undefined;
  const lng = lngStr != null ? Number(lngStr) : undefined;
  const destCoords =
    lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng) ? { lat, lng } : null;
  const dest = options.dest ?? urlDest;
  const planId = options.planId ?? '';

  const {
    tripDays,
    currentRange,
    handleRangeChange: setRange,
  } = useTripRange(options.initialDays ?? []);

  /* DnD state */
  function dedupeDays(days: DayPlan[]): DayPlan[] {
    return Array.from(new Map(days.map((d) => [d.id, d])).values());
  }

  const initialDnDDays = useMemo(
    () =>
      options.initialDays && options.initialDays.length > 0
        ? dedupeDays(options.initialDays)
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

  function persistOnDragEnd() {
    handleDragEnd();
    options.persistDays?.mutate(days);
  }

  /**
   * Updates the planner when the trip range changes.
   *
   * - Persists the new start and end dates to the database.
   * - Syncs the local day plan state with the new range and persists it.
   */
  async function handleRangeChange(r: DateRange | undefined) {
    setRange(r);
    if (!r?.from || !r?.to) return;
    if (options.planId) {
      try {
        await setPlanDateRange(options.planId, r.from, r.to);
      } catch (err) {
        console.error(err);
      }
    }
    const newTripDays = eachDayOfInterval({ start: r.from, end: r.to });
    setDays((prev: DayPlan[]) => {
      const cleaned = dedupeDays(prev);
      const updated = syncDaysWithTripRange(cleaned, newTripDays);
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
    collisionDetection: pointerWithin,
    handleDragStart,
    handleDragOver,
    handleDragEnd: persistOnDragEnd,
    handleRangeChange,
    addActivity,
    removeActivity,
    updateActivity,
    addBlankActivity,
  };
}
