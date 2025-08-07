// src/features/budget/hooks/BudgetContext.tsx
'use client';

import React, { ReactNode } from 'react';
import { createStrictContext } from '@/shared/context/createStrictContext';
import { useBudget } from './useBudgetSupabase';

const [BudgetContextProvider, useBudgetContext] = createStrictContext<ReturnType<typeof useBudget>>(
  'useBudgetContext must be inside BudgetProvider'
);

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
  return <BudgetContextProvider value={value}>{children}</BudgetContextProvider>;
}

export { useBudgetContext };
