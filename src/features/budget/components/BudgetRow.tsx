// src/features/budget/components/BudgetRow.tsx
'use client';

import React, { useId } from 'react';
import { Pencil, Trash2, Check, X, Plus, DollarSign } from 'lucide-react';
import { CATEGORIES, CategoryKey } from '@/shared/constants';
import type { Entry } from '@/features/budget/types';
import { normalizeAmount } from '@/features/planner';
import { useBudgetContext } from '@/features/budget';
import { Button, Input } from '@/shared/ui';

interface ViewProps {
  mode: 'view';
  entry: Entry;
  index: number;
  onEdit: (index: number) => void;
  onDelete?: (index: number) => void;
}

interface EditProps {
  mode: 'edit';
  editEntry: Entry;
  setEditEntry: React.Dispatch<React.SetStateAction<Entry | null>>;
  editAmountInput: string;
  setEditAmountInput: (val: string) => void;
  index: number;
  onSave: (index: number, entry: Entry) => void;
  onCancel: () => void;
}

interface NewProps {
  mode: 'new';
  amountInput: string;
  setAmountInput: (val: string) => void;
  onAdd: () => void;
}

export type BudgetRowProps = ViewProps | EditProps | NewProps;

export default function BudgetRow(props: BudgetRowProps) {
  const { desc, setDesc, cat, setCat, setAmount } = useBudgetContext();
  const baseId = useId();

  if (props.mode === 'view') {
    const { entry, index, onEdit, onDelete } = props;
    return (
      <tr role="row" className="border-t">
        <th scope="row" role="gridcell" className="p-2 text-left font-medium">
          {entry.description}
        </th>
        <td role="gridcell" className="p-2">
          {CATEGORIES.find((c) => c.key === entry.category)?.label}
        </td>
        <td
          role="gridcell"
          className="p-2 text-right"
          aria-label={`Amount: $${entry.amount.toFixed(2)}`}
        >
          {'$' + entry.amount.toFixed(2)}
        </td>
        <td role="gridcell" className="flex justify-end gap-2 p-2 text-right">
          <Button
            size="icon"
            variant="ghost"
            type="button"
            onClick={() => onEdit(index)}
            aria-label="Edit entry"
            className="focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none"
          >
            <Pencil aria-hidden="true" className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            type="button"
            onClick={() => onDelete?.(index)}
            aria-label="Delete entry"
            className="focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none"
          >
            <Trash2 aria-hidden="true" className="size-4" />
          </Button>
        </td>
      </tr>
    );
  }

  if (props.mode === 'edit') {
    const {
      editEntry,
      setEditEntry,
      editAmountInput,
      setEditAmountInput,
      index,
      onSave,
      onCancel,
    } = props;
    return (
      <tr role="row" className="border-t">
        <td role="gridcell" className="p-2">
          <label htmlFor={`edit-description-${baseId}`} className="sr-only">
            Description
          </label>
          <input
            id={`edit-description-${baseId}`}
            name="description"
            value={editEntry.description}
            autoComplete="off"
            autoFocus
            onChange={(ev) =>
              setEditEntry((prev) => prev && { ...prev, description: ev.target.value })
            }
            aria-label="Description"
            className="focus:ring-primary w-full rounded border px-2 py-1 focus:ring-2 focus:ring-offset-2 focus:outline-none"
          />
        </td>
        <td role="gridcell" className="p-2">
          <label htmlFor={`edit-category-${baseId}`} className="sr-only">
            Category
          </label>
          <select
            id={`edit-category-${baseId}`}
            name="category"
            value={editEntry.category}
            onChange={(ev) =>
              setEditEntry(
                (prev) =>
                  prev && {
                    ...prev,
                    category: ev.target.value as CategoryKey,
                  }
              )
            }
            className="focus:ring-primary w-full rounded border px-2 py-1 focus:ring-2 focus:ring-offset-2 focus:outline-none"
          >
            {CATEGORIES.map(({ key, label }) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </td>
        <td role="gridcell" className="p-2 text-right">
          <label htmlFor={`edit-amount-${baseId}`} className="sr-only">
            Amount
          </label>
          <Input
            id={`edit-amount-${baseId}`}
            value={editAmountInput}
            onValueChange={setEditAmountInput}
            onBlur={() =>
              setEditEntry(
                (prev) =>
                  prev && {
                    ...prev,
                    amount: normalizeAmount(editAmountInput),
                  }
              )
            }
            inputSize="default"
            background="default"
            inputMode="decimal"
            autoComplete="off"
            aria-label="Amount"
            icon={<DollarSign aria-hidden="true" className="text-muted-foreground size-4" />}
            className="focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none"
          />
        </td>
        <td role="gridcell" className="flex justify-end gap-2 p-2 text-right">
          <Button
            size="icon"
            variant="ghost"
            type="button"
            onClick={() => onSave(index, editEntry)}
            aria-label="Save entry"
            className="focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none"
          >
            <Check aria-hidden="true" className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            type="button"
            onClick={onCancel}
            aria-label="Cancel edit"
            className="focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none"
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        </td>
      </tr>
    );
  }

  // mode === 'new'
  const { amountInput, setAmountInput, onAdd } = props;
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
          className="focus:ring-primary w-full rounded border px-2 py-1 focus:ring-2 focus:ring-offset-2 focus:outline-none"
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
          className="focus:ring-primary w-full rounded border px-2 py-1 focus:ring-2 focus:ring-offset-2 focus:outline-none"
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
          icon={<DollarSign aria-hidden="true" className="text-muted-foreground size-4" />}
          className="focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none"
        />
      </td>
      <td role="gridcell" className="p-2 text-right">
        <Button
          variant="icon"
          size="icon"
          type="button"
          onClick={onAdd}
          aria-label="Add expense"
          className="focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none"
        >
          <Plus aria-hidden="true" className="size-4" />
        </Button>
      </td>
    </tr>
  );
}
