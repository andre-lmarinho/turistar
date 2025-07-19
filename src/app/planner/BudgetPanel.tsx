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
    <div className="p-4 md:mb-10 bg-background flex flex-col flex-1 w-full gap-4 overflow-x-auto h-full rounded-xl border">
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
          <h3 className="font-semibold flex items-center gap-1">
            Expenses
            <InfoPopup aria-hidden="true" content={BUDGET_INFO.expenses}>
              <Info size={12} className="text-muted-foreground" />
            </InfoPopup>
          </h3>
        </div>

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
      <ActivitiesBudgetPopup
        open={editActivities}
        days={days}
        onUpdate={onUpdateBudget}
        onClose={() => setEditActivities(false)}
      />
    </div>
  );
}
