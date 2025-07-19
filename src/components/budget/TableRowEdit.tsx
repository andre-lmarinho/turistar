// src/components/budget/TableRowEdit.tsx
'use client';

import React from 'react';
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
  return (
    <tr className="border-t">
      <td className="p-2">
        <input
          value={editEntry.description}
          autoComplete="off"
          onChange={(ev) =>
            setEditEntry((prev) => prev && { ...prev, description: ev.target.value })
          }
          aria-label="Description"
          className="border rounded px-2 py-1 w-full"
        />
      </td>
      <td className="p-2">
        <select
          value={editEntry.category}
          onChange={(ev) =>
            setEditEntry((prev) => prev && { ...prev, category: ev.target.value as CategoryKey })
          }
          className="border rounded px-2 py-1 w-full"
        >
          {CATEGORIES.map(({ key, label }) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </td>
      <td className="p-2 text-right">
        <Input
          value={editAmountInput}
          onValueChange={setEditAmountInput}
          onBlur={() =>
            setEditEntry((prev) => prev && { ...prev, amount: normalizeAmount(editAmountInput) })
          }
          inputSize="default"
          background="default"
          icon={<DollarSign aria-hidden="true" className="size-4 text-muted-foreground" />}
          inputMode="decimal"
          autoComplete="off"
          aria-label="Amount"
        />
      </td>
      <td className="p-2 text-right flex gap-2 justify-end">
        <Button size="icon" variant="ghost" onClick={onConfirm} title="Save">
          <Check aria-hidden="true" className="size-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={onCancel} title="Cancel">
          <X aria-hidden="true" className="size-4" />
        </Button>
      </td>
    </tr>
  );
}
