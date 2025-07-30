// src/app/planner/BudgetPanel.tsx
'use client';

import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { useBudget } from '@/hooks/budget/useBudget';
import { BUDGET_INFO } from '@/constants';
import { usePlannerContext } from '@/contexts/PlannerContext';
import {
  BudgetPanelHeader,
  InfoPopup,
  ExpenseTable,
  Button,
  ActivitiesBudgetPopup,
} from '@/components';

export default function BudgetPanel() {
  const { planId, days, updateActivity } = usePlannerContext();
  const activitiesTotal = days.reduce(
    (sum, day) => sum + day.activities.reduce((acc, act) => acc + (act.budget ?? 0), 0),
    0
  );
  const {
    budget,
    setBudget,
    entries,
    categoryTotals,
    totalSpent,
    difference,
    desc,
    setDesc,
    cat,
    setCat,
    amount,
    setAmount,
    handleAdd,
    handleUpdateEntry,
    handleDeleteEntry,
  } = useBudget(planId, activitiesTotal);

  const [editActivities, setEditActivities] = useState(false);

  return (
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
      <BudgetPanelHeader
        budget={budget}
        setBudget={setBudget}
        totalSpent={totalSpent}
        difference={difference}
        categoryTotals={categoryTotals}
      />

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
          <ExpenseTable
            entries={entries}
            desc={desc}
            cat={cat}
            amount={amount}
            setDesc={setDesc}
            setCat={setCat}
            setAmount={setAmount}
            onAdd={handleAdd}
            onUpdate={handleUpdateEntry}
            onDelete={handleDeleteEntry}
          />
        </div>
      </div>

      <ActivitiesBudgetPopup
        open={editActivities}
        days={days}
        onUpdate={(id, amount) => updateActivity(id, { budget: amount })}
        onClose={() => setEditActivities(false)}
      />
    </div>
  );
}
