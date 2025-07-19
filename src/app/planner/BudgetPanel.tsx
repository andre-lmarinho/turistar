// src/app/planner/BudgetPanel.tsx
'use client';

import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { useBudget } from '@/hooks/budget/useBudget';
import { BUDGET_INFO } from '@/constants';
import type { DayPlan } from '@/types';
import {
  BudgetPanelHeader,
  InfoPopup,
  ExpenseTable,
  Button,
  ActivitiesBudgetPopup,
} from '@/components';

interface Props {
  planId: string;
  activitiesTotal: number;
  days: DayPlan[];
  onUpdateBudget: (id: string, amount: number) => void;
}

export default function BudgetPanel({ planId, activitiesTotal, days, onUpdateBudget }: Props) {
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
      className="p-4 bg-background flex flex-col flex-1 w-full gap-4 overflow-x-auto h-full rounded-xl border"
      tabIndex={0}
    >
      <div className="pb-4 flex justify-between">
        <h2 className="text-3xl font-semibold">Traveling Budget</h2>
        <Button size="sm" onClick={() => setEditActivities(true)}>
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
          <h3 id="expenses-heading" className="font-semibold flex items-center gap-1">
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
        onUpdate={onUpdateBudget}
        onClose={() => setEditActivities(false)}
      />
    </div>
  );
}
