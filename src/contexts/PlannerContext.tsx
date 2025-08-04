// src/contexts/PlannerContext.tsx
import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { usePlanner, useSelectedActivity } from '@/hooks';
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
  });
  const hasSyncedRef = React.useRef(false);
  useEffect(() => {
    if (!persist || storedDays === undefined) return;
    if (!hasSyncedRef.current) {
      hasSyncedRef.current = true;
      return;
    }
    if (planner.days.length === 0) return;
    persistDays.mutate(planner.days);
  }, [planner.days, persist, persistDays, storedDays]);

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
