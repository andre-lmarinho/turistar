// src/components/budget/TableRowNew.tsx
'use client';

import React from 'react';
import { Plus, DollarSign } from 'lucide-react';
import { Button, Input } from '@/components';
import { CATEGORIES, CategoryKey } from '@/constants';

export function TableRowNew({
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
  return (
    <tr className="border-t">
      <td className="p-2">
        <input
          value={desc}
          autoComplete="off"
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Description"
          aria-label="Description"
          className="border rounded px-2 py-1 w-full"
        />
      </td>
      <td className="p-2">
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value as CategoryKey)}
          className="border rounded px-2 py-1 w-full"
        >
          {CATEGORIES.map(({ key, label }) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </td>
      <td className="p-2">
        <Input
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
          icon={<DollarSign aria-hidden="true" className="size-4 text-muted-foreground" />}
          inputMode="decimal"
          autoComplete="off"
          placeholder="Amount"
          aria-label="Amount"
        />
      </td>
      <td className="p-2 text-right">
        <Button variant="icon" size="icon" title="Add expense" onClick={onAdd}>
          <Plus aria-hidden="true" className="size-4" />
        </Button>
      </td>
    </tr>
  );
}
