// src/features/planner/components/budget/BudgetPanelHeader.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Info, DollarSign } from 'lucide-react';
import { CATEGORIES } from '@/features/planner/domain/constants/budget';
import { BUDGET_INFO } from '@/features/planner/domain/constants/budgetInfo';
import CategoryProgressBar from '@/features/planner/components/budget/CategoryProgressBar';
import { useBudgetContext } from '@/features/planner/hooks/budget/BudgetContext';
import { Tooltip } from '@/shared/ui/tooltip';
import { Input } from '@/shared/ui/input';
import { normalizeAmount } from '@/shared/utils/normalizeAmount';

interface SummaryValueProps {
  amount: number;
  ariaLabel: string;
}

function SummaryValue({ amount, ariaLabel }: SummaryValueProps) {
  return (
    <span
      className="bg-muted/30 grid w-28 grid-cols-[auto_1fr] items-center overflow-hidden rounded border"
      aria-label={ariaLabel}
    >
      <span className="bg-muted border-r-1">
        <DollarSign aria-hidden="true" className="text-muted-foreground m-2 size-4" />
      </span>
      <span className="w-full px-2 py-1 text-right">{amount.toFixed(2)}</span>
    </span>
  );
}

export default function BudgetPanelHeader() {
  const { budget, setBudget, totalSpent, difference, categoryTotals, persistError } =
    useBudgetContext();
  const [budgetInput, setBudgetInput] = useState(budget ? String(budget) : '');

  useEffect(() => {
    setBudgetInput(budget ? String(budget) : '');
  }, [budget]);

  return (
    <div className="">
      {persistError && (
        <p role="alert" className="text-destructive text-sm md:col-span-3">
          {persistError}
        </p>
      )}
      <div
        role="region"
        aria-labelledby="budget-summary-heading"
        className="mb-2 flex flex-col gap-2"
      >
        <h3 id="budget-summary-heading" className="font-semibold">
          Summary
        </h3>

        {/* Total Budget */}
        <div className="flex flex-wrap items-center justify-between">
          <label htmlFor="budget-input" className="flex items-center gap-1 text-sm">
            Total Budget
            <Tooltip content={BUDGET_INFO.totalBudget} tone="info">
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
            icon={<DollarSign aria-hidden="true" className="text-muted-foreground size-4" />}
            onBlur={() => {
              const val = normalizeAmount(budgetInput);
              setBudget(val);
              setBudgetInput(val ? String(val) : '0');
            }}
          />
        </div>

        {/* Total Spend */}
        <div className="flex flex-wrap items-center justify-between">
          <span className="flex items-center gap-1 text-sm">
            Total Spent
            <Tooltip content={BUDGET_INFO.totalSpent} tone="info">
              <Info size={12} aria-hidden="true" className="text-muted-foreground" />
            </Tooltip>
          </span>
          <SummaryValue amount={totalSpent} ariaLabel={`Total spent: $${totalSpent.toFixed(2)}`} />
        </div>

        {/* Difference */}
        <div className="flex flex-wrap items-center justify-between">
          <span className="flex items-center gap-1 text-sm">
            Difference
            <Tooltip content={BUDGET_INFO.difference} tone="info">
              <Info size={12} aria-hidden="true" className="text-muted-foreground" />
            </Tooltip>
          </span>
          <SummaryValue amount={difference} ariaLabel={`Difference: $${difference.toFixed(2)}`} />
        </div>
      </div>

      <div role="region" aria-labelledby="budget-categories-heading" className="flex flex-col">
        <h3 id="budget-categories-heading" className="pt-4 pb-2 font-semibold">
          Categories
        </h3>
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
