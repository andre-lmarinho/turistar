// src/contexts/PlannerContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
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
}: {
  children: ReactNode;
  initialDays?: DayPlan[];
  planId: string;
  dest?: string;
}) {
  const { data: storedDays } = usePlanDays(planId);
  const planner = usePlanner({
    initialDays: (storedDays as unknown as DayPlan[]) ?? initialDays,
    planId,
    dest,
  });
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
