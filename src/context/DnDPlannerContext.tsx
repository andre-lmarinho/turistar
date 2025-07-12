// src/context/DnDPlannerContext.tsx
'use client';

import { createContext, useContext } from 'react';
import { useDnDPlanner } from '@/hooks';
import type { DayPlan } from '@/types';

/* ------------------------------------------------------------------ */
/*  Context boilerplate                                               */
/* ------------------------------------------------------------------ */
type PlannerState = ReturnType<typeof useDnDPlanner>;

const PlannerCtx = createContext<PlannerState | null>(null);

export function DnDPlannerProvider({
  children,
  initialDays,
}: {
  children: React.ReactNode;
  initialDays: DayPlan[];
}) {
  const value = useDnDPlanner(initialDays);
  return <PlannerCtx.Provider value={value}>{children}</PlannerCtx.Provider>;
}

export function useDnDPlannerContext() {
  const ctx = useContext(PlannerCtx);
  if (!ctx) throw new Error('DnDPlannerProvider missing');
  return ctx;
}
