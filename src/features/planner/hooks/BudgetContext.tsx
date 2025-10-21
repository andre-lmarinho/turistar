'use client';

import { createContextProvider } from '@/shared/lib/createContextProvider';
import { useBudget } from './state/budget/useBudget';
import type { Entry } from '@/features/planner/types/budget';

export const [BudgetProvider, useBudgetContext] = createContextProvider(
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
