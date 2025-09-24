// src/app/planner/BudgetPanel.tsx
'use client';

import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { BUDGET_INFO } from '@/shared/constants/budgetInfo';
import { usePlannerContext } from '@/features/planner/hooks/PlannerContext';
import { BudgetProvider } from '@/features/planner/hooks/budget/BudgetContext';
import BudgetPanelHeader from '@/features/planner/components/budget/BudgetPanelHeader';
import ExpenseTable from '@/features/planner/components/budget/ExpenseTable';
import ActivitiesBudgetPopup from '@/features/planner/components/budget/activities/ActivitiesBudget';
import { Button } from '@/shared/ui/button';
import InfoPopup from '@/shared/ui/popups/InfoPopup';
import type { Entry } from '@/features/planner/types/budget/budget';

interface Props {
  initialBudget?: number;
  initialEntries?: Entry[];
  persist?: boolean;
}

function BudgetPanel({ initialBudget, initialEntries, persist = true }: Props) {
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
          <Button variant="icon" size="sm" onClick={() => setEditActivities(true)}>
            Budget Your Activities
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3">
          <BudgetPanelHeader />

          <div className="col-span-2 md:ml-12">
            <h3 id="expenses-heading" className="flex items-center gap-1 pb-2 font-semibold">
              Expenses
              <InfoPopup content={BUDGET_INFO.expenses} aria-hidden="true">
                <Info size={12} className="text-muted-foreground" aria-hidden="true" />
              </InfoPopup>
            </h3>

            <div aria-labelledby="expenses-heading">
              <ExpenseTable />
            </div>
          </div>
        </div>
        <ActivitiesBudgetPopup
          open={editActivities}
          days={days}
          onUpdate={(id, amount) => updateActivity(id, { budget: amount })}
          onClose={() => setEditActivities(false)}
        />
      </div>
    </BudgetProvider>
  );
}

export default React.memo(BudgetPanel);
