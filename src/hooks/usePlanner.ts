// src/hooks/usePlanner.ts
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { closestCenter } from '@dnd-kit/core';

import { useTripRange } from '@/hooks/useTripRange';
import { useItinerary } from '@/hooks/useItinerary';
import { useDnDPlanner } from '@/hooks/useDnDPlanner';
import { buildInitialDays } from '@/utils/initialDays';
import { syncDaysWithTripRange } from '@/utils/syncDaysWithTripRange';

/**
 * High-level planner hook
 * - URL params      (dest, ?start, ?end)
 * - Date-range      (tripDays)
 * - Data fetch      (itinerary)
 * - Drag-and-drop   (days board)
 * - Helpers         (add / remove / update)
 */
export function usePlanner(enabled: boolean) {
  /* ----------------------- URL + date range ----------------------- */
  const params = useSearchParams();
  const router = useRouter();
  const dest = params.get('dest')?.trim().toLowerCase() ?? '';
  const [planId] = useState(() => params.get('plan') ?? crypto.randomUUID());

  /* Ensure the unique plan id is reflected in the URL
   *
   * We only want to run this effect:
   * 1. On initial mount (or whenever planId changes),
   * 2. Not on every params change (params object gets a new reference each render).
   *
   * That's why we omit `params` from the dependency list and disable the rule.
   */
  useEffect(() => {
    if (!params.get('plan')) {
      const search = new URLSearchParams(params.toString());
      search.set('plan', planId);
      router.replace(`/planner?${search.toString()}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId, router]);

  const { tripDays, currentRange, handleRangeChange } = useTripRange(dest, planId);
  // only fetch itinerary when `enabled` is true
  const { isLoading, error } = useItinerary(dest, { enabled });

  /* -------------------------- DnD state --------------------------- */
  const {
    days,
    setDays,
    sensors,
    activeId,
    handleDragStart,
    handleDragOver,
    addActivity,
    removeActivity,
    updateActivity,
    addBlankActivity,
  } = useDnDPlanner(buildInitialDays(tripDays));

  const storageKey = `itinerary-${planId}`;

  /* Load initial state from localStorage
   *
   * We want to run this effect only when the storageKey changes —
   * i.e. when switching to a new plan.
   * Including `setDays` would cause the effect to re-run
   * whenever days state updates, leading to unwanted loops.
   *
   * That's why we omit `setDays` and disable the rule.
   */
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setDays(parsed);
        }
      } catch {
        /* ignore invalid JSON */
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  /* ------------------ Sync days on trip range change ------------------ */
  useEffect(() => {
    setDays((prevDays) => syncDaysWithTripRange(prevDays, tripDays));
  }, [tripDays, setDays]);

  /* ---------------------- Persist to localStorage --------------------- */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(days));
    }
  }, [storageKey, days]);

  /* --------------------------- export ----------------------------- */
  return {
    dest,
    days,
    tripDays,
    currentRange,
    isLoading,
    error,
    activeId,

    /* DnD configuration */
    sensors,
    collisionDetection: closestCenter,
    handleDragStart,
    handleDragOver,

    /* Date-picker */
    handleRangeChange,

    /* Add / remove helpers for the filter panel */
    addActivity,
    removeActivity,
    updateActivity,
    addBlankActivity,
  };
}
