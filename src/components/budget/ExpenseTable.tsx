// src/components/budget/ExpenseTable.tsx
'use client';

import React, { useState } from 'react';
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react';
import { Button } from '@/components';
import { CATEGORIES, CategoryKey } from '@/constants';
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

  const startEdit = (index: number) => {
    setEditIndex(index);
    setEditEntry(entries[index]);
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
          <th className="p-2 text-left">Description</th>
          <th className="p-2 text-left">Category</th>
          <th className="p-2 text-right">Amount</th>
          <th className="p-2 text-right">Actions</th>
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
                  <input
                    type="number"
                    autoComplete="off"
                    value={editEntry?.amount ?? 0}
                    onChange={(ev) =>
                      setEditEntry((prev) => prev && { ...prev, amount: Number(ev.target.value) })
                    }
                    aria-label="Amount"
                    className="border rounded px-2 py-1 w-full text-right"
                  />
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
            <input
              type="number"
              autoComplete="off"
              min={0}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Amount"
              aria-label="Amount"
              className="border rounded px-2 py-1 w-full text-right"
            />
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
