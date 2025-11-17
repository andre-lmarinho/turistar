'use client';

import React, { useState, useEffect } from 'react';
import type { Entry } from '@/features/planner/types/budget';
import { useBudgetContext } from '@/features/planner/hooks/BudgetContext';
import { BudgetRowView } from '@/features/planner/components/budget/BudgetRowView';
import { BudgetRowEdit } from '@/features/planner/components/budget/BudgetRowEdit';
import { BudgetRowNew } from '@/features/planner/components/budget/BudgetRowNew';

export function ExpenseTable({ canEdit = true }: { canEdit?: boolean }) {
  const { entries, amount, handleAdd, handleDeleteEntry, handleUpdateEntry } = useBudgetContext();
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editEntry, setEditEntry] = useState<Entry | null>(null);
  const [amountInput, setAmountInput] = useState(amount ? String(amount) : '');
  const [editAmountInput, setEditAmountInput] = useState('');

  useEffect(() => {
    setAmountInput(amount ? String(amount) : '');
  }, [amount]);

  const startEdit = (index: number) => {
    if (!canEdit) return;
    setEditIndex(index);
    setEditEntry(entries[index]);
    setEditAmountInput(String(entries[index].amount));
  };

  const cancelEdit = () => {
    setEditIndex(null);
    setEditEntry(null);
  };

  return (
    <table
      role="table"
      aria-labelledby="expense-table-caption"
      className="w-full rounded border text-sm"
    >
      <caption id="expense-table-caption" className="sr-only">
        Expenses table showing description, category, amount, and actions
      </caption>
      <thead role="rowgroup" className="bg-card">
        <tr role="row">
          <th scope="col" className="p-2 text-left font-normal">
            Description
          </th>
          <th scope="col" className="p-2 text-left font-normal">
            Category
          </th>
          <th scope="col" className="w-32 p-2 text-right font-normal">
            Amount
          </th>
          <th scope="col" className="p-2 text-right font-normal">
            Actions
          </th>
        </tr>
      </thead>
      <tbody role="rowgroup">
        {entries.map((entry, index) =>
          canEdit && editIndex === index && editEntry ? (
            <BudgetRowEdit
              key={entry.id}
              index={index}
              editEntry={editEntry}
              setEditEntry={setEditEntry}
              editAmountInput={editAmountInput}
              setEditAmountInput={setEditAmountInput}
              onSave={(idx, updated) => {
                handleUpdateEntry(idx, updated);
                cancelEdit();
              }}
              onCancel={cancelEdit}
            />
          ) : (
            <BudgetRowView
              key={entry.id}
              index={index}
              entry={entry}
              onEdit={startEdit}
              onDelete={canEdit ? handleDeleteEntry : undefined}
              canEdit={canEdit}
            />
          )
        )}
        {canEdit ? (
          <BudgetRowNew amountInput={amountInput} setAmountInput={setAmountInput} onAdd={handleAdd} />
        ) : null}
      </tbody>
    </table>
  );
}
