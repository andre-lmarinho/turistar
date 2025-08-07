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

// Common table cells -------------------------------------------------------
interface DescriptionCellProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoFocus?: boolean;
  placeholder?: string;
}

function DescriptionCell({ id, value, onChange, autoFocus, placeholder }: DescriptionCellProps) {
  return (
    <td role="gridcell" className="p-2">
      <label htmlFor={id} className="sr-only">
        Description
      </label>
      <input
        id={id}
        name="description"
        value={value}
        autoComplete="off"
        autoFocus={autoFocus}
        placeholder={placeholder}
        onChange={onChange}
        aria-label="Description"
        className="focus:ring-primary w-full rounded border px-2 py-1 focus:ring-2 focus:ring-offset-2 focus:outline-none"
      />
    </td>
  );
}

interface CategoryCellProps {
  id: string;
  value: CategoryKey;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

function CategoryCell({ id, value, onChange }: CategoryCellProps) {
  return (
    <td role="gridcell" className="p-2">
      <label htmlFor={id} className="sr-only">
        Category
      </label>
      <select
        id={id}
        name="category"
        value={value}
        onChange={onChange}
        className="focus:ring-primary w-full rounded border px-2 py-1 focus:ring-2 focus:ring-offset-2 focus:outline-none"
      >
        {CATEGORIES.map(({ key, label }) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
    </td>
  );
}

interface AmountCellProps {
  id: string;
  value: string;
  onValueChange: (val: string) => void;
  onBlur: () => void;
  placeholder?: string;
}

function AmountCell({ id, value, onValueChange, onBlur, placeholder }: AmountCellProps) {
  return (
    <td role="gridcell" className="p-2 text-right">
      <label htmlFor={id} className="sr-only">
        Amount
      </label>
      <Input
        id={id}
        value={value}
        onValueChange={onValueChange}
        onBlur={onBlur}
        inputSize="default"
        background="default"
        inputMode="decimal"
        autoComplete="off"
        aria-label="Amount"
        placeholder={placeholder}
        icon={<DollarSign aria-hidden="true" className="text-muted-foreground size-4" />}
        className="focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none"
      />
    </td>
  );
}

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
        <DescriptionCell
          id={`edit-description-${baseId}`}
          value={editEntry.description}
          onChange={(ev) =>
            setEditEntry((prev) => prev && { ...prev, description: ev.target.value })
          }
          autoFocus
        />
        <CategoryCell
          id={`edit-category-${baseId}`}
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
        />
        <AmountCell
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
        />
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
      <DescriptionCell
        id={`new-description-${baseId}`}
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Description"
      />
      <CategoryCell
        id={`new-category-${baseId}`}
        value={cat}
        onChange={(e) => setCat(e.target.value as CategoryKey)}
      />
      <AmountCell
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
        placeholder="Amount"
      />
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
