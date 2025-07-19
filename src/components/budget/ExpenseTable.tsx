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
              <InfoPopup content={BUDGET_INFO.description}>
                <Info aria-hidden="true" size={12} className="text-muted-foreground" />
              </InfoPopup>
            </span>
          </th>
          <th className="p-2 text-left">
            <span className="flex items-center gap-1">
              Category
              <InfoPopup content={BUDGET_INFO.category}>
                <Info aria-hidden="true" size={12} className="text-muted-foreground" />
              </InfoPopup>
            </span>
          </th>
          <th className="p-2 text-right w-32">
            <span className="flex items-center gap-1 justify-end">
              Amount
              <InfoPopup content={BUDGET_INFO.amount}>
                <Info aria-hidden="true" size={12} className="text-muted-foreground" />
              </InfoPopup>
            </span>
          </th>
          <th className="p-2 text-right">
            <span className="flex items-center gap-1 justify-end">
              Actions
              <InfoPopup content={BUDGET_INFO.actions}>
                <Info size={12} aria-hidden="true" className="text-muted-foreground" />
              </InfoPopup>
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        {entries.map((e, idx) =>
          editIndex === idx && editEntry ? (
            <TableRowEdit
              key={idx}
              editEntry={editEntry}
              setEditEntry={setEditEntry}
              editAmountInput={editAmountInput}
              setEditAmountInput={setEditAmountInput}
              normalizeAmount={normalizeAmount}
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
          normalizeAmount={normalizeAmount}
          onAdd={onAdd}
        />
      </tbody>
    </table>
  );
}
