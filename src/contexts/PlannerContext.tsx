// src/contexts/PlannerContext.tsx
import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { usePlanner, useSelectedActivity, useDebounce } from '@/hooks';
import { usePlanDays } from '@/hooks/planner/usePlanDaysSupabase';
import type { DayPlan } from '@/types';

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
  const hasSyncedRef = React.useRef(false);
  const lastSerialized = React.useRef('');
  const serialized = JSON.stringify(planner.days);
  const debounced = useDebounce(serialized, 500);

  useEffect(() => {
    if (storedDays !== undefined && !hasSyncedRef.current) {
      hasSyncedRef.current = true;
      lastSerialized.current = serialized;
    }
  }, [serialized, storedDays]);

  useEffect(() => {
    if (!persist || !hasSyncedRef.current) return;
    if (planner.days.length === 0) return;
    if (debounced === lastSerialized.current) return;
    lastSerialized.current = debounced;
    persistDays.mutate(planner.days);
  }, [debounced, planner.days, persist, persistDays, storedDays]);

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
