// src/hooks/usePlanner.ts

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { closestCenter } from '@dnd-kit/core';

import { useTripRange, useCatalog, usePlannerBoard } from '@/hooks';
import { buildInitialDays, syncDaysWithTripRange } from '@/utils';
import { useLocalStorageSync } from '@/lib';
import type { DayPlan } from '@/types';

export function usePlanner(enabled: boolean) {
  /* URL + date range */
  const params = useSearchParams();
  const router = useRouter();
  const dest = params.get('dest')?.trim().toLowerCase() ?? '';
  const [planId] = useState(() => params.get('plan') ?? crypto.randomUUID());

  useEffect(() => {
    if (!params.get('plan')) {
      const search = new URLSearchParams(params.toString());
      search.set('plan', planId);
      router.replace(`/planner?${search.toString()}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId, router]);

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
  } = usePlannerBoard(buildInitialDays(tripDays));

  const storageKey = `catalog-${planId}`;
  useLocalStorageSync(storageKey, days, setDays);

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
