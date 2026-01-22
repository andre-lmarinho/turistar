"use client";

import { useBudgetContext } from "../hooks/BudgetContext";
import { AmountDisplay } from "../ui/AmountDisplay";

interface SummaryProps {
  canEdit?: boolean;
}

export function Summary({ canEdit = true }: SummaryProps) {
  const { budget, setBudget, totalSpent, difference, persistError } = useBudgetContext();

  if (persistError) {
    return (
      <p role="alert" className="text-destructive text-sm">
        {persistError}
      </p>
    );
  }

  return (
    <section aria-labelledby="budget-summary-heading" className="flex flex-col gap-2">
      <h2 id="budget-summary-heading" className="font-semibold">
        Summary
      </h2>

      <div className="flex flex-wrap items-center justify-between">
        <label htmlFor="budget-input" className="text-sm">
          Total Budget
        </label>
        <AmountDisplay
          inputId="budget-input"
          value={budget}
          variant="input"
          onValueChange={setBudget}
          canEdit={canEdit}
          ariaLabel="Total Budget"
          placeholder="Budget"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between">
        <span className="text-sm">Total Spent</span>
        <AmountDisplay value={totalSpent} variant="span" ariaLabel="Total spent" />
      </div>

      <div className="flex flex-wrap items-center justify-between">
        <span className="text-sm">Difference</span>
        <AmountDisplay value={difference} variant="span" ariaLabel="Difference" />
      </div>
    </section>
  );
}
