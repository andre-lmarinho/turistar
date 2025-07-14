// src/app/planner/BudgetPanel.tsx
'use client';

import React from 'react';
import { useBudget } from '@/hooks/useBudget';
import { CATEGORIES } from '@/constants';

import { CalculatorButton, CategoryProgressBar, ExpenseTable } from '@/components';
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

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 flex flex-col gap-2">
          <label htmlFor="budget-input" className="font-medium">
            Total Budget
          </label>
          <input
            id="budget-input"
            type="number"
            min={0}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="border rounded px-2 py-1"
          />
          <div className="flex items-center justify-between pt-2 font-medium">
            <span>Total Spent</span>
            <span>${totalSpent.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between font-medium">
            <span>Difference</span>
            <span>${difference.toFixed(2)}</span>
          </div>
        </div>

        <div className="col-span-2 flex flex-col gap-2">
          {CATEGORIES.map(({ key }, idx) => (
            <CategoryProgressBar
              key={key}
              category={key}
              value={categoryTotals[key]}
              total={totalSpent}
              colorIndex={idx}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Expenses</h3>
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
