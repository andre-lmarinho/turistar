// src/features/planner/components/budget/ExpenseTable.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { BUDGET_INFO } from '@/features/planner/domain/constants/budgetInfo';
import type { Entry } from '@/features/planner/types/budget/budget';
import BudgetRow from '@/features/planner/components/budget/BudgetRow';
import { useBudgetContext } from '@/features/planner/hooks/budget/BudgetContext';
import { Tooltip } from '@/shared/ui/tooltip';

export default function ExpenseTable() {
  const { entries, amount, handleAdd, handleDeleteEntry, handleUpdateEntry } = useBudgetContext();
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editEntry, setEditEntry] = useState<Entry | null>(null);
  const [amountInput, setAmountInput] = useState(amount ? String(amount) : '');
  const [editAmountInput, setEditAmountInput] = useState('');

  useEffect(() => {
    setAmountInput(amount ? String(amount) : '');
  }, [amount]);

  const startEdit = (index: number) => {
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
          <th scope="col" className="p-2 text-left">
            <span className="flex items-center gap-1 font-normal">
              Description
              <Tooltip content={BUDGET_INFO.description} tone="info">
                <Info aria-hidden="true" size={12} className="text-muted-foreground" />
              </Tooltip>
            </span>
          </th>
          <th scope="col" className="p-2 text-left">
            <span className="flex items-center gap-1 font-normal">
              Category
              <Tooltip content={BUDGET_INFO.category} tone="info">
                <Info aria-hidden="true" size={12} className="text-muted-foreground" />
              </Tooltip>
            </span>
          </th>
          <th scope="col" className="w-32 p-2 text-right">
            <span className="flex items-center justify-end gap-1 font-normal">
              Amount
              <Tooltip content={BUDGET_INFO.amount} tone="info">
                <Info aria-hidden="true" size={12} className="text-muted-foreground" />
              </Tooltip>
            </span>
          </th>
          <th scope="col" className="p-2 text-right">
            <span className="flex items-center justify-end gap-1 font-normal">
              Actions
              <Tooltip content={BUDGET_INFO.actions} tone="info">
                <Info aria-hidden="true" size={12} className="text-muted-foreground" />
              </Tooltip>
            </span>
          </th>
        </tr>
      </thead>
      <tbody role="rowgroup">
        {entries.map((e, idx) =>
          editIndex === idx && editEntry ? (
            <BudgetRow
              key={idx}
              mode="edit"
              index={idx}
              editEntry={editEntry}
              setEditEntry={setEditEntry}
              editAmountInput={editAmountInput}
              setEditAmountInput={setEditAmountInput}
              onSave={(index, entry) => {
                handleUpdateEntry(index, entry);
                cancelEdit();
              }}
              onCancel={cancelEdit}
            />
          ) : (
            <BudgetRow
              key={idx}
              mode="view"
              index={idx}
              entry={e}
              onEdit={startEdit}
              onDelete={handleDeleteEntry}
            />
          )
        )}
        <BudgetRow
          mode="new"
          amountInput={amountInput}
          setAmountInput={setAmountInput}
          onAdd={handleAdd}
        />
      </tbody>
    </table>
  );
}
