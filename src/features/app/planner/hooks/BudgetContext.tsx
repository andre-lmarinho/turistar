"use client";

import type { Entry } from "@/features/app/planner/types/budget";
import { createContextProvider } from "@/shared/lib/createContextProvider";
import { useBudget } from "./state/budget/useBudget";

export const [BudgetProvider, useBudgetContext] = createContextProvider(
  ({
    planId,
    activitiesTotal,
    initialBudget,
    initialEntries,
    persist = true,
    canEdit = true,
  }: {
    planId: string;
    activitiesTotal: number;
    initialBudget?: number;
    initialEntries?: Entry[];
    persist?: boolean;
    canEdit?: boolean;
  }) => useBudget(planId, activitiesTotal, { initialBudget, initialEntries, persist, canEdit }),
  "useBudgetContext must be inside BudgetProvider"
);
