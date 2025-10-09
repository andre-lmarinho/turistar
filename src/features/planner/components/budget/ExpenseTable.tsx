'use client';

import React, { useState, useEffect } from 'react';
import type { Entry } from '@/features/planner/types/budget/budget';
import BudgetRow from '@/features/planner/components/budget/BudgetRow';
import { useBudgetContext } from '@/features/planner/hooks/budget/BudgetContext';

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
