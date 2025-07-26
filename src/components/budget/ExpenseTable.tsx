// src/components/budget/ExpenseTable.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { InfoPopup, TableRowEdit, TableRowEntry, TableRowNew } from '@/components';
import { CategoryKey, BUDGET_INFO } from '@/constants';
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

export default function ExpenseTable({
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
    <table
      role="table"
      aria-labelledby="expense-table-caption"
      className="w-full rounded border text-sm"
    >
      <caption id="expense-table-caption" className="sr-only">
        Expenses table showing description, category, amount, and actions
      </caption>
      <thead role="rowgroup" className="bg-muted">
        <tr role="row">
          <th scope="col" className="p-2 text-left">
            <span className="flex items-center gap-1">
              Description
              <InfoPopup content={BUDGET_INFO.description}>
                <Info aria-hidden="true" size={12} className="text-muted-foreground" />
              </InfoPopup>
            </span>
          </th>
          <th scope="col" className="p-2 text-left">
            <span className="flex items-center gap-1">
              Category
              <InfoPopup content={BUDGET_INFO.category}>
                <Info aria-hidden="true" size={12} className="text-muted-foreground" />
              </InfoPopup>
            </span>
          </th>
          <th scope="col" className="w-32 p-2 text-right">
            <span className="flex items-center justify-end gap-1">
              Amount
              <InfoPopup content={BUDGET_INFO.amount}>
                <Info aria-hidden="true" size={12} className="text-muted-foreground" />
              </InfoPopup>
            </span>
          </th>
          <th scope="col" className="p-2 text-right">
            <span className="flex items-center justify-end gap-1">
              Actions
              <InfoPopup content={BUDGET_INFO.actions}>
                <Info aria-hidden="true" size={12} className="text-muted-foreground" />
              </InfoPopup>
            </span>
          </th>
        </tr>
      </thead>
      <tbody role="rowgroup">
        {entries.map((e, idx) =>
          editIndex === idx && editEntry ? (
            <TableRowEdit
              key={idx}
              editEntry={editEntry}
              setEditEntry={setEditEntry}
              editAmountInput={editAmountInput}
              setEditAmountInput={setEditAmountInput}
              onConfirm={confirmEdit}
              onCancel={cancelEdit}
            />
          ) : (
            <TableRowEntry key={idx} index={idx} entry={e} onEdit={startEdit} onDelete={onDelete} />
          )
        )}
        <TableRowNew
          desc={desc}
          cat={cat}
          amountInput={amountInput}
          setDesc={setDesc}
          setCat={setCat}
          setAmount={setAmount}
          setAmountInput={setAmountInput}
          onAdd={onAdd}
        />
      </tbody>
    </table>
  );
}
