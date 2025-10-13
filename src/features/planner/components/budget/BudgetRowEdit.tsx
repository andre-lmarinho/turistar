'use client';

import React, { useId } from 'react';
import type { Entry } from '@/features/planner/types/budget/budget';
import { Check, X } from '@/shared/ui/icon';
import { normalizeAmount } from '@/shared/utils/normalizeAmount';
import { useBudgetRowInputs } from '@/features/planner/hooks/budget/useBudgetRowInputs';

type BudgetRowEditProps = {
  index: number;
  editEntry: Entry;
  setEditEntry: React.Dispatch<React.SetStateAction<Entry | null>>;
  editAmountInput: string;
  setEditAmountInput: (value: string) => void;
  onSave: (index: number, entry: Entry) => void;
  onCancel: () => void;
};

export default function BudgetRowEdit({
  index,
  editEntry,
  setEditEntry,
  editAmountInput,
  setEditAmountInput,
  onSave,
  onCancel,
}: BudgetRowEditProps) {
  const baseId = useId();

  const { descriptionCell, categoryCell, amountCell } = useBudgetRowInputs({
    description: {
      id: `description-${baseId}`,
      value: editEntry.description,
      onChange: (value) => setEditEntry((prev) => (prev ? { ...prev, description: value } : prev)),
      autoFocus: true,
    },
    category: {
      id: `category-${baseId}`,
      value: editEntry.category,
      onChange: (value) => setEditEntry((prev) => (prev ? { ...prev, category: value } : prev)),
    },
    amount: {
      id: `amount-${baseId}`,
      value: editAmountInput,
      onValueChange: setEditAmountInput,
      onBlur: () =>
        setEditEntry((prev) =>
          prev
            ? {
                ...prev,
                amount: normalizeAmount(editAmountInput),
              }
            : prev
        ),
    },
  });

  return (
    <tr role="row" className="border-t">
      {descriptionCell}
      {categoryCell}
      {amountCell}
      <td role="gridcell" className="flex justify-end gap-2 p-2 text-right">
        <button
          type="button"
          onClick={() => onSave(index, editEntry)}
          aria-label="Save entry"
          className="border-border bg-background text-muted-foreground hover:bg-muted/60 hover:text-foreground inline-flex size-8 cursor-pointer items-center justify-center rounded-full border transition-colors"
        >
          <Check className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel edit"
          className="border-border bg-background text-muted-foreground hover:bg-muted/60 hover:text-foreground inline-flex size-8 cursor-pointer items-center justify-center rounded-full border transition-colors"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </td>
    </tr>
  );
}
