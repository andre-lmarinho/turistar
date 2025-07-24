// src/components/budget/TableRowEdit.tsx
'use client';

import React, { useId } from 'react';
import { Check, X, DollarSign } from 'lucide-react';
import { Button, Input } from '@/components';
import { CATEGORIES, CategoryKey } from '@/constants';
import type { Entry } from '@/types';

export default function TableRowEdit({
  editEntry,
  setEditEntry,
  editAmountInput,
  setEditAmountInput,
  onConfirm,
  onCancel,
  normalizeAmount,
}: {
  editEntry: Entry;
  setEditEntry: React.Dispatch<React.SetStateAction<Entry | null>>;
  editAmountInput: string;
  setEditAmountInput: (val: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  normalizeAmount: (val: string) => number;
}) {
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
          className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
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
          className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
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
          icon={<DollarSign aria-hidden="true" className="size-4 text-muted-foreground" />}
          className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        />
      </td>
      <td role="gridcell" className="p-2 text-right flex gap-2 justify-end">
        <Button
          size="icon"
          variant="ghost"
          type="button"
          onClick={onConfirm}
          aria-label="Save entry"
          className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <Check aria-hidden="true" className="size-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          type="button"
          onClick={onCancel}
          aria-label="Cancel edit"
          className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <X aria-hidden="true" className="size-4" />
        </Button>
      </td>
    </tr>
  );
}
