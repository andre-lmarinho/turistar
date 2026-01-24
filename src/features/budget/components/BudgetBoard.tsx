"use client";

import { memo } from "react";

import type { DayPlan } from "@/features/activity/types";
import { usePlannerContext } from "@/features/plan/hooks/PlannerContext";

import { BudgetProvider } from "../hooks/BudgetContext";
import type { Entry } from "../types";
import { CategoryChart } from "./CategoryChart";
import { ExpenseTable } from "./ExpenseTable";
import { Summary } from "./Summary";

interface Props {
  initialBudget?: number;
  initialEntries?: Entry[];
  persist?: boolean;
  canEdit?: boolean;
}

export const BudgetBoard = memo(function BudgetBoard({
  initialBudget,
  initialEntries,
  persist = true,
  canEdit = true,
}: Props) {
  const { planId, days } = usePlannerContext();
  const activitiesTotal = days.reduce<number>(
    (sum, day: DayPlan) =>
      sum +
      day.activities.reduce<number>((acc, act: DayPlan["activities"][number]) => acc + (act.budget ?? 0), 0),
    0
  );

  return (
    <BudgetProvider
      planId={planId}
      activitiesTotal={activitiesTotal}
      initialBudget={initialBudget}
      initialEntries={initialEntries}
      persist={persist}
      canEdit={canEdit}>
      <div className="bg-background grid md:grid-cols-3 grid-cols-1 h-full w-full gap-4 overflow-x-auto rounded-xl border p-4">
        <div>
          <Summary canEdit={canEdit} />
          <CategoryChart />
        </div>
        <ExpenseTable canEdit={canEdit} />
      </div>
    </BudgetProvider>
  );
});

BudgetBoard.displayName = "BudgetBoard";
