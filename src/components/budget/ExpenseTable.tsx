// src/components/budget/ExpenseTable.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, Check, X, Info, DollarSign } from 'lucide-react';
import { Button, Tooltip } from '@/components';
import { CATEGORIES, CategoryKey, BUDGET_INFO } from '@/constants';
import type { Entry } from '@/types';

interface ExpenseTableProps {
  entries: Entry[];
  desc: string;
  cat: CategoryKey;
  amount: number;
  setDesc: (v: string) => void;
  setCat: (v: CategoryKey) => void;
  setAmount: (v: number) => void;
  onAdd: () => void;
  onUpdate?: (index: number, updated: Entry) => void;
  onDelete?: (index: number) => void;
}

export function ExpenseTable({
  entries,
  desc,
  cat,
  amount,
  setDesc,
  setCat,
  setAmount,
  onAdd,
  onUpdate,
  onDelete,
}: ExpenseTableProps) {
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editEntry, setEditEntry] = useState<Entry | null>(null);
  const [amountInput, setAmountInput] = useState(amount ? String(amount) : '');
  const [editAmountInput, setEditAmountInput] = useState('');

  useEffect(() => {
    setAmountInput(amount ? String(amount) : '');
  }, [amount]);

  const normalizeAmount = (val: string) => {
    const cleaned = val
      .replace(/[^0-9.]/g, '')
      .replace(/,/g, '')
      .replace(/^0+(?!\.)/, '');
    const num = parseFloat(cleaned);
    return isFinite(num) ? num : 0;
  };

  const startEdit = (index: number) => {
    setEditIndex(index);
    setEditEntry(entries[index]);
    setEditAmountInput(String(entries[index].amount));
  };

  const cancelEdit = () => {
    setEditIndex(null);
    setEditEntry(null);
  };

  const confirmEdit = () => {
    if (editIndex !== null && editEntry && onUpdate) {
      onUpdate(editIndex, editEntry);
      cancelEdit();
    }
  };

  return (
    <table className="w-full text-sm border rounded">
      <thead className="bg-muted">
        <tr>
          <th className="p-2 text-left">
            <span className="flex items-center gap-1">
              Description
              <Tooltip content={BUDGET_INFO.description}>
                <Info size={12} className="text-muted-foreground" />
              </Tooltip>
            </span>
          </th>
          <th className="p-2 text-left">
            <span className="flex items-center gap-1">
              Category
              <Tooltip content={BUDGET_INFO.category}>
                <Info size={12} className="text-muted-foreground" />
              </Tooltip>
            </span>
          </th>
          <th className="p-2 text-right">
            <span className="flex items-center gap-1 justify-end">
              Amount
              <Tooltip content={BUDGET_INFO.amount}>
                <Info size={12} className="text-muted-foreground" />
              </Tooltip>
            </span>
          </th>
          <th className="p-2 text-right">
            <span className="flex items-center gap-1 justify-end">
              Actions
              <Tooltip content={BUDGET_INFO.actions}>
                <Info size={12} className="text-muted-foreground" />
              </Tooltip>
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        {entries.map((e, idx) => (
          <tr key={idx} className="border-t">
            {editIndex === idx ? (
              <>
                <td className="p-2">
                  <input
                    value={editEntry?.description ?? ''}
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
                    value={editEntry?.category}
                    onChange={(ev) =>
                      setEditEntry(
                        (prev) => prev && { ...prev, category: ev.target.value as CategoryKey }
                      )
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
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                    <input
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      value={editAmountInput}
                      onChange={(ev) => setEditAmountInput(ev.target.value)}
                      onBlur={() =>
                        setEditEntry(
                          (prev) => prev && { ...prev, amount: normalizeAmount(editAmountInput) }
                        )
                      }
                      aria-label="Amount"
                      className="border rounded px-2 py-1 pl-5 w-full text-right bg-background [appearance:textfield]"
                    />
                  </div>
                </td>
                <td className="p-2 text-right flex gap-2 justify-end">
                  <Button size="icon" variant="ghost" onClick={confirmEdit} title="Save">
                    <Check className="size-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={cancelEdit} title="Cancel">
                    <X className="size-4" />
                  </Button>
                </td>
              </>
            ) : (
              <>
                <td className="p-2">{e.description}</td>
                <td className="p-2">{CATEGORIES.find((c) => c.key === e.category)?.label}</td>
                <td className="p-2 text-right">${e.amount.toFixed(2)}</td>
                <td className="p-2 text-right flex gap-2 justify-end">
                  <Button size="icon" variant="ghost" onClick={() => startEdit(idx)} title="Edit">
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDelete?.(idx)}
                    title="Delete"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </td>
              </>
            )}
          </tr>
        ))}

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
            <div className="relative">
              <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                onBlur={() => {
                  const val = normalizeAmount(amountInput);
                  setAmount(val);
                  setAmountInput(val ? String(val) : '0');
                }}
                placeholder="Amount"
                aria-label="Amount"
                className="border rounded px-2 py-1 pl-5 w-full text-right bg-background [appearance:textfield]"
              />
            </div>
          </td>
          <td className="p-2 text-right">
            <Button variant="icon" size="icon" title="Add expense" onClick={onAdd}>
              <Plus className="size-4" />
            </Button>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
