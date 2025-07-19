// src/components/budget/TableRowNew.tsx
'use client';

import React, { useId } from 'react';
import { Plus, DollarSign } from 'lucide-react';
import { Button, Input } from '@/components';
import { CATEGORIES, CategoryKey } from '@/constants';

export default function TableRowNew({
  desc,
  setDesc,
  cat,
  setCat,
  amountInput,
  setAmountInput,
  setAmount,
  normalizeAmount,
  onAdd,
}: {
  desc: string;
  setDesc: (v: string) => void;
  cat: CategoryKey;
  setCat: (v: CategoryKey) => void;
  amountInput: string;
  setAmountInput: (val: string) => void;
  setAmount: (v: number) => void;
  normalizeAmount: (val: string) => number;
  onAdd: () => void;
}) {
  const baseId = useId();

  return (
    <tr role="row" className="border-t">
      <td role="gridcell" className="p-2">
        <label htmlFor={`new-description-${baseId}`} className="sr-only">
          Description
        </label>
        <input
          id={`new-description-${baseId}`}
          name="description"
          value={desc}
          autoComplete="off"
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Description"
          aria-label="Description"
          className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        />
      </td>
      <td role="gridcell" className="p-2">
        <label htmlFor={`new-category-${baseId}`} className="sr-only">
          Category
        </label>
        <select
          id={`new-category-${baseId}`}
          name="category"
          value={cat}
          onChange={(e) => setCat(e.target.value as CategoryKey)}
          className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          {CATEGORIES.map(({ key, label }) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </td>
      <td role="gridcell" className="p-2">
        <label htmlFor={`new-amount-${baseId}`} className="sr-only">
          Amount
        </label>
        <Input
          id={`new-amount-${baseId}`}
          value={amountInput}
          onValueChange={(val) => {
            setAmountInput(val);
            setAmount(normalizeAmount(val));
          }}
          onBlur={() => {
            const val = normalizeAmount(amountInput);
            setAmount(val);
            setAmountInput(val ? String(val) : '0');
          }}
          inputSize="default"
          background="default"
          inputMode="decimal"
          autoComplete="off"
          placeholder="Amount"
          aria-label="Amount"
          icon={<DollarSign aria-hidden="true" className="size-4 text-muted-foreground" />}
          className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        />
      </td>
      <td role="gridcell" className="p-2 text-right">
        <Button
          variant="icon"
          size="icon"
          type="button"
          onClick={onAdd}
          aria-label="Add expense"
          className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <Plus aria-hidden="true" className="size-4" />
        </Button>
      </td>
    </tr>
  );
}
