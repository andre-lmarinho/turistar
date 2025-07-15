// src/app/planner/BudgetPanel.tsx
'use client';

import React from 'react';
import { Info } from 'lucide-react';
import { useBudget } from '@/hooks/useBudget';
import { BUDGET_INFO } from '@/constants';
import BudgetPanelHeader from '@/components/budget/BudgetPanelHeader';

import { Tooltip, CalculatorButton, ExpenseTable } from '@/components';
interface Props {
  activitiesTotal: number;
}

export default function BudgetPanel({ activitiesTotal }: Props) {
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
  } = useBudget(activitiesTotal);

  return (
    <div className="p-4 md:mb-10 bg-background flex flex-col flex-1 w-full gap-4 overflow-x-auto h-full rounded-xl border">
      <div className="pb-4 flex justify-between">
        <h2 className="text-3xl font-semibold">Traveling Budget</h2>
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
            <Tooltip content={BUDGET_INFO.expenses}>
              <Info size={12} className="text-muted-foreground" />
            </Tooltip>
          </h3>
          <CalculatorButton />
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
    </div>
  );
}
