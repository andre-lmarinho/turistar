// src/features/budget/hooks/BudgetContext.tsx
'use client';

import React, { ReactNode } from 'react';
import { createStrictContext } from '@/shared/context/createStrictContext';
import { useBudget } from './useBudgetSupabase';
import type { Entry } from '@/features/budget/types';

const [BudgetContextProvider, useBudgetContext] = createStrictContext<ReturnType<typeof useBudget>>(
  'useBudgetContext must be inside BudgetProvider'
);

export function BudgetProvider({
  children,
  planId,
  activitiesTotal,
  initialBudget,
  initialEntries,
  persist = true,
}: {
  children: ReactNode;
  planId: string;
  activitiesTotal: number;
  initialBudget?: number;
  initialEntries?: Entry[];
  persist?: boolean;
}) {
  const value = useBudget(planId, activitiesTotal, { initialBudget, initialEntries, persist });
  return <BudgetContextProvider value={value}>{children}</BudgetContextProvider>;
}

export { useBudgetContext };
