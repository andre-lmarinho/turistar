// src/components/planner/budget/TableRowEdit.tsx
'use client';

import React, { useId } from 'react';
import { Check, X, DollarSign } from 'lucide-react';
import { Button, Input } from '@/components';
import { CATEGORIES, CategoryKey } from '@/shared/constants';
import type { Entry } from '@/shared/types';
import { normalizeAmount } from '@/features/planner/services';
import { useBudgetContext } from '@/contexts';

export default function TableRowEdit({
  editEntry,
  setEditEntry,
  editAmountInput,
  setEditAmountInput,
  index,
  onCancel,
}: {
  editEntry: Entry;
  setEditEntry: React.Dispatch<React.SetStateAction<Entry | null>>;
  editAmountInput: string;
  setEditAmountInput: (val: string) => void;
  index: number;
  onCancel: () => void;
}) {
  const { handleUpdateEntry } = useBudgetContext();

  const confirm = () => {
    handleUpdateEntry(index, editEntry);
    onCancel();
  };
  // useId generates a unique suffix for each instance
  const baseId = useId();

  return (
    <tr role="row" className="border-t">
      <td role="gridcell" className="p-2">
        <label htmlFor={`edit-description-${baseId}`} className="sr-only">
          Description
        </label>
        <input
          id={`edit-description-${baseId}`}
          name="description"
          value={editEntry.description}
          autoComplete="off"
          autoFocus
          onChange={(ev) =>
            setEditEntry((prev) => prev && { ...prev, description: ev.target.value })
          }
          aria-label="Description"
          className="focus:ring-primary w-full rounded border px-2 py-1 focus:ring-2 focus:ring-offset-2 focus:outline-none"
        />
      </td>
      <td role="gridcell" className="p-2">
        <label htmlFor={`edit-category-${baseId}`} className="sr-only">
          Category
        </label>
        <select
          id={`edit-category-${baseId}`}
          name="category"
          value={editEntry.category}
          onChange={(ev) =>
            setEditEntry(
              (prev) =>
                prev && {
                  ...prev,
                  category: ev.target.value as CategoryKey,
                }
            )
          }
          className="focus:ring-primary w-full rounded border px-2 py-1 focus:ring-2 focus:ring-offset-2 focus:outline-none"
        >
          {CATEGORIES.map(({ key, label }) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </td>
      <td role="gridcell" className="p-2 text-right">
        <label htmlFor={`edit-amount-${baseId}`} className="sr-only">
          Amount
        </label>
        <Input
          id={`edit-amount-${baseId}`}
          value={editAmountInput}
          onValueChange={setEditAmountInput}
          onBlur={() =>
            setEditEntry(
              (prev) =>
                prev && {
                  ...prev,
                  amount: normalizeAmount(editAmountInput),
                }
            )
          }
          inputSize="default"
          background="default"
          inputMode="decimal"
          autoComplete="off"
          aria-label="Amount"
          icon={<DollarSign aria-hidden="true" className="text-muted-foreground size-4" />}
          className="focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none"
        />
      </td>
      <td role="gridcell" className="flex justify-end gap-2 p-2 text-right">
        <Button
          size="icon"
          variant="ghost"
          type="button"
          onClick={confirm}
          aria-label="Save entry"
          className="focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none"
        >
          <Check aria-hidden="true" className="size-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          type="button"
          onClick={onCancel}
          aria-label="Cancel edit"
          className="focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none"
        >
          <X aria-hidden="true" className="size-4" />
        </Button>
      </td>
    </tr>
  );
}
