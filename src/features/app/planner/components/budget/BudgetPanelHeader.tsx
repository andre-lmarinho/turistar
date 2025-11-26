'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign } from '@/shared/ui/icon';
import { CATEGORIES } from '@/features/app/planner/domain/constants/budget';
import { CategoryProgressBar } from '@/features/app/planner/components/budget/CategoryProgressBar';
import { useBudgetContext } from '@/features/app/planner/hooks/BudgetContext';
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

export function BudgetPanelHeader({ canEdit = true }: { canEdit?: boolean }) {
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
          <label htmlFor="budget-input" className="text-sm">
            Total Budget
          </label>

          <div className="bg-background grid w-28 grid-cols-[auto_1fr] items-center overflow-hidden rounded border">
            <span className="bg-muted border-r-1">
              <DollarSign aria-hidden="true" className="text-muted-foreground m-2 size-4" />
            </span>
            <input
              id="budget-input"
              value={budgetInput}
              onChange={(event) => setBudgetInput(event.target.value)}
              autoComplete="off"
              placeholder="Budget"
              className="focus:ring-primary w-full bg-transparent px-2 py-1 text-right outline-none focus:ring-2 focus:ring-offset-2"
              inputMode="decimal"
              aria-label="Total Budget"
              onBlur={() => {
                const val = normalizeAmount(budgetInput);
                setBudget(val);
                setBudgetInput(val ? String(val) : '0');
              }}
              disabled={!canEdit}
            />
          </div>
        </div>

        {/* Total Spend */}
        <div className="flex flex-wrap items-center justify-between">
          <span className="text-sm">Total Spent</span>
          <SummaryValue amount={totalSpent} ariaLabel={`Total spent: $${totalSpent.toFixed(2)}`} />
        </div>

        {/* Difference */}
        <div className="flex flex-wrap items-center justify-between">
          <span className="text-sm">Difference</span>
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
