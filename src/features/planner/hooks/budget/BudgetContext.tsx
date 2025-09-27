// src/features/planner/hooks/budget/BudgetContext.tsx
'use client';

import { createContextProvider } from '@/shared/lib/createContextProvider';
import { useBudget } from './useBudgetSupabase';
import type { Entry } from '@/features/planner/types/budget/budget';

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
