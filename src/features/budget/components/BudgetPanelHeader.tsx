// src/features/budget/components/BudgetPanelHeader.tsx
'use client';

import React, { useState } from 'react';
import { Info, DollarSign } from 'lucide-react';
import { CATEGORIES, BUDGET_INFO } from '@/shared/constants';
import { CategoryProgressBar, useBudgetContext } from '@/features/budget';
import { InfoPopup, Input } from '@/shared/ui';
import { normalizeAmount } from '@/features/planner';

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
      <span className="border-r-1 bg-gray-100">
        <DollarSign aria-hidden="true" className="text-muted-foreground m-2 size-4" />
      </span>
      <span className="w-full px-2 py-1 text-right">{'$' + amount.toFixed(2)}</span>
    </span>
  );
}

export default function BudgetPanelHeader() {
  const { budget, setBudget, totalSpent, difference, categoryTotals, persistError } =
    useBudgetContext();
  const [budgetInput, setBudgetInput] = useState(budget ? String(budget) : '');

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {persistError && (
        <p role="alert" className="text-destructive text-sm md:col-span-3">
          {persistError}
        </p>
      )}
      <div
        role="region"
        aria-labelledby="budget-summary-heading"
        className="flex flex-col gap-2 md:col-span-1"
      >
        <h4 id="budget-summary-heading" className="font-semibold">
          Summary
        </h4>

        {/* Total Budget */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 font-medium">
          <label htmlFor="budget-input" className="flex items-center gap-1 font-medium">
            Total Budget
            <InfoPopup content={BUDGET_INFO.totalBudget}>
              <Info size={12} aria-hidden="true" className="text-muted-foreground" />
            </InfoPopup>
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
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 font-medium">
          <span className="flex items-center gap-1">
            Total Spent
            <InfoPopup content={BUDGET_INFO.totalSpent}>
              <Info size={12} aria-hidden="true" className="text-muted-foreground" />
            </InfoPopup>
          </span>
          <SummaryValue amount={totalSpent} ariaLabel={`Total spent: $${totalSpent.toFixed(2)}`} />
        </div>

        {/* Difference */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 font-medium">
          <span className="flex items-center gap-1">
            Difference
            <InfoPopup content={BUDGET_INFO.difference}>
              <Info size={12} aria-hidden="true" className="text-muted-foreground" />
            </InfoPopup>
          </span>
          <SummaryValue amount={difference} ariaLabel={`Difference: $${difference.toFixed(2)}`} />
        </div>
      </div>

      <div
        role="region"
        aria-labelledby="budget-categories-heading"
        className="flex flex-col md:col-span-2"
      >
        <h4 id="budget-categories-heading" className="font-semibold">
          Categories
        </h4>
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
