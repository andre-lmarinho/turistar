// src/contexts/PlannerContext.tsx
import React, { createContext, useContext, type ReactNode } from 'react';
import { usePlanner, useSelectedActivity } from '@/hooks';
import type { DayPlan } from '@/types';

// Combine planner and selected activity state into a single context type
export type PlannerCtx = ReturnType<typeof usePlanner> & ReturnType<typeof useSelectedActivity>;

export const PlannerContext = createContext<PlannerCtx | null>(null);

interface PlannerProviderProps {
  children: ReactNode;
  initialDays?: DayPlan[];
  planId?: string;
  dest?: string;
}

export function PlannerProvider({ children, initialDays, planId, dest }: PlannerProviderProps) {
  // Manage board and activity state with existing hooks
  const planner = usePlanner({ initialDays, planId, dest });
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
