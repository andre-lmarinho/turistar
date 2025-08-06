// src/features/budget/hooks/BudgetContext.tsx
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useBudget } from './useBudgetSupabase';

export const BudgetContext = createContext<ReturnType<typeof useBudget> | null>(null);

export function BudgetProvider({
  children,
  planId,
  activitiesTotal,
}: {
  children: ReactNode;
  planId: string;
  activitiesTotal: number;
}) {
  const value = useBudget(planId, activitiesTotal);
  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
}

export function useBudgetContext() {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error('useBudgetContext must be inside BudgetProvider');
  return ctx;
}
