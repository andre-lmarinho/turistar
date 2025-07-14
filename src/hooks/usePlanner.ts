// src/hooks/usePlanner.ts
'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { closestCenter } from '@dnd-kit/core';

import { useTripRange, useCatalog, usePlannerBoard } from '@/hooks';
import { buildInitialDays, syncDaysWithTripRange } from '@/utils';
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
  const lastSaved = useRef<string | null>(null);

  /* Load initial state */
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setDays(parsed);
        }
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  /* Sync on range change */
  useEffect(() => {
    setDays((prevDays: DayPlan[]) => syncDaysWithTripRange(prevDays, tripDays));
  }, [tripDays, setDays]);

  /* Persist to localStorage */
  useEffect(() => {
    const serialized = JSON.stringify(days);
    if (lastSaved.current !== serialized) {
      lastSaved.current = serialized;
      localStorage.setItem(storageKey, serialized);
    }
  }, [storageKey, days]);

  return {
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
