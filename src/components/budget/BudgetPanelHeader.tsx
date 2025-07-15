// src/components/budget/BudgetPanelHeader.tsx
'use client';

import React, { useState } from 'react';
import { Info, DollarSign } from 'lucide-react';
import { Tooltip } from '@/components';
import { CATEGORIES, BUDGET_INFO } from '@/constants';
import { CategoryProgressBar, Input } from '@/components';

interface Props {
  budget: number;
  setBudget: (val: number) => void;
  totalSpent: number;
  difference: number;
  categoryTotals: Record<string, number>;
}

export default function BudgetPanelHeader({
  budget,
  setBudget,
  totalSpent,
  difference,
  categoryTotals,
}: Props) {
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
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-1 flex flex-col gap-2">
        <h4 className="font-semibold">Summary</h4>

        {/* Total Budget */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 font-medium">
          <label htmlFor="budget-input" className="font-medium flex items-center gap-1">
            Total Budget
            <Tooltip content={BUDGET_INFO.totalBudget}>
              <Info size={12} aria-hidden="true" className="text-muted-foreground" />
            </Tooltip>
          </label>

          <Input
            labelId="budget-input"
            value={budgetInput}
            onValueChange={setBudgetInput}
            inputSize="default"
            background="default"
            autoComplete="off"
            placeholder="Budget"
            icon={<DollarSign aria-hidden="true" className="size-4 text-muted-foreground" />}
            onBlur={() => {
              const val = normalizeAmount(budgetInput);
              setBudget(val);
              setBudgetInput(val ? String(val) : '0');
            }}
          />
        </div>

        {/* Total Spend */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 font-medium">
          <span className="flex items-center gap-1">
            Total Spent
            <Tooltip content={BUDGET_INFO.totalSpent}>
              <Info size={12} aria-hidden="true" className="text-muted-foreground" />
            </Tooltip>
          </span>
          <span className="px-2 py-1 text-right">${totalSpent.toFixed(2)}</span>
        </div>

        {/* Difference */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 font-medium">
          <span className="flex items-center gap-1">
            Difference
            <Tooltip content={BUDGET_INFO.difference}>
              <Info size={12} aria-hidden="true" className="text-muted-foreground" />
            </Tooltip>
          </span>
          <span className="px-2 py-1 text-right">${difference.toFixed(2)}</span>
        </div>
      </div>

      <div className="col-span-2 flex flex-col">
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
  );
}
