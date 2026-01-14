"use client";

import { useEffect, useState } from "react";
import { BudgetRowEdit } from "@/features/app/planner/components/budget/BudgetRowEdit";
import { BudgetRowNew } from "@/features/app/planner/components/budget/BudgetRowNew";
import { BudgetRowView } from "@/features/app/planner/components/budget/BudgetRowView";
import { useBudgetContext } from "@/features/app/planner/hooks/BudgetContext";
import type { Entry } from "@/features/app/planner/types/budget";

export function ExpenseTable({ canEdit = true }: { canEdit?: boolean }) {
  const { entries, amount, handleAdd, handleDeleteEntry, handleUpdateEntry } = useBudgetContext();
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editEntry, setEditEntry] = useState<Entry | null>(null);
  const [amountInput, setAmountInput] = useState(amount ? String(amount) : "");
  const [editAmountInput, setEditAmountInput] = useState("");

  useEffect(() => {
    setAmountInput(amount ? String(amount) : "");
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
    <table aria-labelledby="expense-table-caption" className="w-full rounded border text-sm">
      <caption id="expense-table-caption" className="sr-only">
        Expenses table showing description, category, amount, and actions
      </caption>
      <thead className="bg-card">
        <tr>
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
      <tbody>
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
