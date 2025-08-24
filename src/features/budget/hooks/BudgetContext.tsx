// src/features/budget/hooks/BudgetContext.tsx
'use client';

import { createContextProvider } from '@/shared/context/createContextProvider';
import { useBudget } from './useBudgetSupabase';
import type { Entry } from '@/features/budget/types';

const [BudgetProvider, useBudgetContext] = createContextProvider(
  ({
    planId,
    activitiesTotal,
    initialBudget,
    initialEntries,
    persist = true,
  }: {
    planId: string;
    activitiesTotal: number;
    initialBudget?: number;
    initialEntries?: Entry[];
    persist?: boolean;
  }) => useBudget(planId, activitiesTotal, { initialBudget, initialEntries, persist }),
  'useBudgetContext must be inside BudgetProvider'
);

export { BudgetProvider, useBudgetContext };
