// src/contexts/PlannerContext.tsx
'use client';

import React, { createContext, useContext, ReactNode, useEffect, useRef } from 'react';
import { usePlanner, useSelectedActivity, useDebounce, usePlanDays } from '@/hooks';
import type { DayPlan } from '@/shared/types';

type PlannerCtx = ReturnType<typeof usePlanner> & ReturnType<typeof useSelectedActivity>;

export const PlannerContext = createContext<PlannerCtx | null>(null);

export function PlannerProvider({
  children,
  initialDays,
  planId,
  dest,
  persist = true,
}: {
  children: ReactNode;
  initialDays?: DayPlan[];
  planId: string;
  dest?: string;
  persist?: boolean;
}) {
  const { data: storedDays, persistDays } = usePlanDays(planId, persist);
  const planner = usePlanner({
    initialDays: (storedDays as unknown as DayPlan[]) ?? initialDays,
    planId,
    dest,
    persistDays,
  });
  const hasSyncedRef = useRef(false);
  const lastSerialized = useRef('');
  const serialized = JSON.stringify(planner.days);
  const debounced = useDebounce(serialized, 500);
  const queueRef = useRef<DayPlan[] | null>(null);
  const prevDaysRef = useRef(planner.days);

  useEffect(() => {
    prevDaysRef.current = planner.days;
  }, [planner.days]);

  useEffect(() => {
    if (storedDays !== undefined && !hasSyncedRef.current) {
      hasSyncedRef.current = true;
      lastSerialized.current = serialized;
    }
  }, [serialized, storedDays]);

  const flush = React.useCallback(async () => {
    if (persistDays.isPending || !queueRef.current) return;
    const state = queueRef.current;
    queueRef.current = null;
    try {
      await persistDays.mutateAsync(state);
      lastSerialized.current = JSON.stringify(state);
      prevDaysRef.current = state;
    } catch {
      planner.setDays(prevDaysRef.current);
    } finally {
      if (queueRef.current) flush();
    }
  }, [persistDays, planner]);

  useEffect(() => {
    if (!persist || !hasSyncedRef.current) return;
    if (planner.days.length === 0) return;
    if (debounced === lastSerialized.current) return;
    queueRef.current = planner.days;
    flush();
  }, [debounced, planner.days, persist, persistDays.isPending, flush]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (queueRef.current) flush();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && queueRef.current) flush();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [flush]);

  const selected = useSelectedActivity(planner.days, planner.setDays, {
    addActivity: planner.addActivity,
    removeActivity: planner.removeActivity,
    updateActivity: planner.updateActivity,
    addBlankActivity: planner.addBlankActivity,
  });
  return (
    <PlannerContext.Provider value={{ ...planner, ...selected }}>
      {children}
    </PlannerContext.Provider>
  );
}

export function usePlannerContext() {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error('usePlannerContext must be inside PlannerProvider');
  return ctx;
}
