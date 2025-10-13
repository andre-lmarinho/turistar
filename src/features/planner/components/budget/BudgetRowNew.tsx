'use client';

import React, { useId } from 'react';
import { Plus } from '@/shared/ui/icon';
import { normalizeAmount } from '@/shared/utils/normalizeAmount';
import { useBudgetContext } from '@/features/planner/hooks/budget/BudgetContext';
import { useBudgetRowInputs } from '@/features/planner/hooks/budget/useBudgetRowInputs';

type BudgetRowNewProps = {
  amountInput: string;
  setAmountInput: (value: string) => void;
  onAdd: () => void;
};

export default function BudgetRowNew({ amountInput, setAmountInput, onAdd }: BudgetRowNewProps) {
  const { desc, setDesc, cat, setCat, setAmount } = useBudgetContext();
  const baseId = useId();

  const { descriptionCell, categoryCell, amountCell } = useBudgetRowInputs({
    description: {
      id: `description-${baseId}`,
      value: desc,
      onChange: (value) => setDesc(value),
      placeholder: 'Description',
    },
    category: {
      id: `category-${baseId}`,
      value: cat,
      onChange: (value) => setCat(value),
    },
    amount: {
      id: `amount-${baseId}`,
      value: amountInput,
      onValueChange: (value) => {
        setAmountInput(value);
        setAmount(normalizeAmount(value));
      },
      onBlur: () => {
        const normalized = normalizeAmount(amountInput);
        setAmount(normalized);
        setAmountInput(normalized ? String(normalized) : '0');
      },
      placeholder: 'Amount',
    },
    amountCellClassName: 'p-2',
  });

  return (
    <tr role="row" className="border-t">
      {descriptionCell}
      {categoryCell}
      {amountCell}
      <td role="gridcell" className="p-2 text-right">
        <button
          type="button"
          onClick={onAdd}
          aria-label="Add expense"
          className="border-border bg-background text-muted-foreground hover:bg-muted/60 hover:text-foreground inline-flex size-8 cursor-pointer items-center justify-center rounded-full border transition-colors"
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </td>
    </tr>
  );
}
