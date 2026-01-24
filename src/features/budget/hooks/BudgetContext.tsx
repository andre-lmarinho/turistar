"use client";

import { createContextProvider } from "@/shared/lib/createContextProvider";

import type { Entry } from "../types";
import { useBudget } from "./useBudget";

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
