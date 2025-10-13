'use client';

import React, { useState } from 'react';
import { usePlannerContext } from '@/features/planner/hooks/PlannerContext';
import { BudgetProvider } from '@/features/planner/hooks/budget/BudgetContext';
import { BudgetPanelHeader } from '@/features/planner/components/budget/BudgetPanelHeader';
import { ExpenseTable } from '@/features/planner/components/budget/ExpenseTable';
import { BudgetDialog } from '@/features/planner/components/budget/BudgetDialog';
import type { Entry } from '@/features/planner/types/budget/budget';

interface Props {
  initialBudget?: number;
  initialEntries?: Entry[];
  persist?: boolean;
}

function BudgetBoardComponent({ initialBudget, initialEntries, persist = true }: Props) {
  const { planId, days, updateActivity } = usePlannerContext();
  const activitiesTotal = days.reduce(
    (sum, day) => sum + day.activities.reduce((acc, act) => acc + (act.budget ?? 0), 0),
    0
  );

  const [editActivities, setEditActivities] = useState(false);

  return (
    <BudgetProvider
      planId={planId}
      activitiesTotal={activitiesTotal}
      initialBudget={initialBudget}
      initialEntries={initialEntries}
      persist={persist}
    >
      <div
        role="region"
        aria-label="Budget panel"
        className="bg-background flex h-full w-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl border p-4"
        tabIndex={0}
      >
        <div className="flex justify-between pb-4">
          <h2 className="text-3xl font-semibold">Traveling Budget</h2>
          <button
            type="button"
            onClick={() => setEditActivities(true)}
            className="border-border bg-background text-foreground hover:bg-muted/60 inline-flex cursor-pointer items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-colors"
          >
            Budget Your Activities
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3">
          <BudgetPanelHeader />

          <div className="col-span-2 md:ml-12">
            <h3 id="expenses-heading" className="pb-2 font-semibold">
              Expenses
            </h3>

            <div aria-labelledby="expenses-heading">
              <ExpenseTable />
            </div>
          </div>
        </div>
        <BudgetDialog
          open={editActivities}
          days={days}
          onUpdate={(id, amount) => updateActivity(id, { budget: amount })}
          onClose={() => setEditActivities(false)}
        />
      </div>
    </BudgetProvider>
  );
}

const BudgetBoard = React.memo(BudgetBoardComponent);

BudgetBoard.displayName = 'BudgetBoard';

export { BudgetBoard };
