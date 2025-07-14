// src/app/planner/BudgetPanel.tsx
'use client';

import React, { useState } from 'react';
import { Info, DollarSign } from 'lucide-react';
import { useBudget } from '@/hooks/useBudget';
import { CATEGORIES, BUDGET_INFO } from '@/constants';
import { Tooltip } from '@/components';

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

  const normalizeAmount = (val: string) => {
    const cleaned = val
      .replace(/[^0-9.]/g, '')
      .replace(/,/g, '')
      .replace(/^0+(?!\.)/, '');
    const num = parseFloat(cleaned);
    return isFinite(num) ? num : 0;
  };

  const [budgetInput, setBudgetInput] = useState(budget ? String(budget) : '');

  return (
    <div className="p-4 md:mb-10 bg-background flex flex-col flex-1 w-full gap-4 overflow-x-auto h-full rounded-xl border">
      <div className="pb-4 flex justify-between">
        <h2 className="text-3xl font-semibold">Traveling Budget</h2>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 flex flex-col gap-2">
          <h4 className="font-semibold">Summary</h4>
          <label htmlFor="budget-input" className="font-medium flex items-center gap-1">
            Total Budget
            <Tooltip content={BUDGET_INFO.totalBudget}>
              <Info size={12} className="text-muted-foreground" />
            </Tooltip>
          </label>
          <div className="relative w-32">
            <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              id="budget-input"
              type="text"
              inputMode="decimal"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              onBlur={() => {
                const val = normalizeAmount(budgetInput);
                setBudget(val);
                setBudgetInput(val ? String(val) : '0');
              }}
              className="border rounded px-2 py-1 pl-6 w-full text-right bg-background [appearance:textfield]"
            />
          </div>
          <div className="flex items-center justify-between pt-2 font-medium">
            <span className="flex items-center gap-1">
              Total Spent
              <Tooltip content={BUDGET_INFO.totalSpent}>
                <Info size={12} className="text-muted-foreground" />
              </Tooltip>
            </span>
            <span>${totalSpent.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between font-medium">
            <span className="flex items-center gap-1">
              Difference
              <Tooltip content={BUDGET_INFO.difference}>
                <Info size={12} className="text-muted-foreground" />
              </Tooltip>
            </span>
            <span>${difference.toFixed(2)}</span>
          </div>
        </div>

        <div className="col-span-2 flex flex-col gap-2">
          <h4 className="font-semibold">Categories</h4>
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
