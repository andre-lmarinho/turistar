// src/app/planner/BudgetPanel.tsx
'use client';

import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { BUDGET_INFO } from '@/shared/constants';
import { usePlannerContext } from '@/features/planner';
import {
  BudgetProvider,
  BudgetPanelHeader,
  ExpenseTable,
  ActivitiesBudgetPopup,
} from '@/features/budget';
import { InfoPopup, Button } from '@/shared/ui';

function BudgetPanel() {
  const { planId, days, updateActivity } = usePlannerContext();
  const activitiesTotal = days.reduce(
    (sum, day) => sum + day.activities.reduce((acc, act) => acc + (act.budget ?? 0), 0),
    0
  );

  const [editActivities, setEditActivities] = useState(false);

  return (
    <BudgetProvider planId={planId} activitiesTotal={activitiesTotal}>
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
        <BudgetPanelHeader />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 id="expenses-heading" className="flex items-center gap-1 font-semibold">
              Expenses
              <InfoPopup content={BUDGET_INFO.expenses} aria-hidden="true">
                <Info size={12} className="text-muted-foreground" aria-hidden="true" />
              </InfoPopup>
            </h3>
          </div>

          <div aria-labelledby="expenses-heading">
            <ExpenseTable />
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
