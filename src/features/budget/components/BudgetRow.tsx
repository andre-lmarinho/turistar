// src/features/budget/components/BudgetRow.tsx
'use client';

import React, { useId } from 'react';
import { Pencil, Trash2, Check, X, Plus, DollarSign } from 'lucide-react';
import { CATEGORIES, CategoryKey } from '@/shared/constants';
import { normalizeAmount } from '@/shared/utils';
import { useBudgetContext } from '@/features/budget';
import type { Entry } from '@/features/budget/types';
import { Button, Input } from '@/shared/ui';

// Props -------------------------------------------------------------
type ViewProps = {
  mode: 'view';
  entry: Entry;
  index: number;
  onEdit: (index: number) => void;
  onDelete?: (index: number) => void;
};

type EditProps = {
  mode: 'edit';
  editEntry: Entry;
  setEditEntry: React.Dispatch<React.SetStateAction<Entry | null>>;
  editAmountInput: string;
  setEditAmountInput: (val: string) => void;
  index: number;
  onSave: (index: number, entry: Entry) => void;
  onCancel: () => void;
};

type NewProps = {
  mode: 'new';
  amountInput: string;
  setAmountInput: (val: string) => void;
  onAdd: () => void;
};

type BudgetRowProps = ViewProps | EditProps | NewProps;

export default function BudgetRow(props: BudgetRowProps) {
  const { desc, setDesc, cat, setCat, setAmount } = useBudgetContext();
  const baseId = useId();

  const renderDescriptionCell = () => {
    if (props.mode === 'view') {
      return (
        <th scope="row" role="gridcell" className="p-2 text-left font-medium">
          {props.entry.description}
        </th>
      );
    }

    const value = props.mode === 'edit' ? props.editEntry.description : desc;
    const onChange =
      props.mode === 'edit'
        ? (ev: React.ChangeEvent<HTMLInputElement>) =>
            props.setEditEntry((prev) => prev && { ...prev, description: ev.target.value })
        : (ev: React.ChangeEvent<HTMLInputElement>) => setDesc(ev.target.value);
    const placeholder = props.mode === 'new' ? 'Description' : undefined;
    const autoFocus = props.mode === 'edit';

    return (
      <td role="gridcell" className="p-2">
        <label htmlFor={`description-${baseId}`} className="sr-only">
          Description
        </label>
        <input
          id={`description-${baseId}`}
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
  };

  const renderCategoryCell = () => {
    if (props.mode === 'view') {
      return (
        <td role="gridcell" className="p-2">
          {CATEGORIES.find((c) => c.key === props.entry.category)?.label}
        </td>
      );
    }

    const value = props.mode === 'edit' ? props.editEntry.category : cat;
    const onChange =
      props.mode === 'edit'
        ? (ev: React.ChangeEvent<HTMLSelectElement>) =>
            props.setEditEntry(
              (prev) => prev && { ...prev, category: ev.target.value as CategoryKey }
            )
        : (ev: React.ChangeEvent<HTMLSelectElement>) => setCat(ev.target.value as CategoryKey);

    return (
      <td role="gridcell" className="p-2">
        <label htmlFor={`category-${baseId}`} className="sr-only">
          Category
        </label>
        <select
          id={`category-${baseId}`}
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
  };

  const renderAmountCell = () => {
    if (props.mode === 'view') {
      return (
        <td
          role="gridcell"
          className="p-2 text-right"
          aria-label={`Amount: $${props.entry.amount.toFixed(2)}`}
        >
          {'$' + props.entry.amount.toFixed(2)}
        </td>
      );
    }

    if (props.mode === 'edit') {
      return (
        <td role="gridcell" className="p-2 text-right">
          <label htmlFor={`amount-${baseId}`} className="sr-only">
            Amount
          </label>
          <Input
            id={`amount-${baseId}`}
            value={props.editAmountInput}
            onValueChange={props.setEditAmountInput}
            onBlur={() =>
              props.setEditEntry(
                (prev) =>
                  prev && {
                    ...prev,
                    amount: normalizeAmount(props.editAmountInput),
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
      );
    }

    // mode === 'new'
    return (
      <td role="gridcell" className="p-2">
        <label htmlFor={`amount-${baseId}`} className="sr-only">
          Amount
        </label>
        <Input
          id={`amount-${baseId}`}
          value={props.amountInput}
          onValueChange={(val) => {
            props.setAmountInput(val);
            setAmount(normalizeAmount(val));
          }}
          onBlur={() => {
            const val = normalizeAmount(props.amountInput);
            setAmount(val);
            props.setAmountInput(val ? String(val) : '0');
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
    );
  };

  const renderActionCell = () => {
    if (props.mode === 'view') {
      return (
        <td role="gridcell" className="flex justify-end gap-2 p-2 text-right">
          <Button
            size="icon"
            variant="ghost"
            type="button"
            onClick={() => props.onEdit(props.index)}
            aria-label="Edit entry"
            className="focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none"
          >
            <Pencil aria-hidden="true" className="size-4" />
          </Button>
          {props.onDelete && (
            <Button
              size="icon"
              variant="ghost"
              type="button"
              onClick={() => props.onDelete && props.onDelete(props.index)}
              aria-label="Delete entry"
              className="focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none"
            >
              <Trash2 aria-hidden="true" className="size-4" />
            </Button>
          )}
        </td>
      );
    }

    if (props.mode === 'edit') {
      return (
        <td role="gridcell" className="flex justify-end gap-2 p-2 text-right">
          <Button
            size="icon"
            variant="ghost"
            type="button"
            onClick={() => props.onSave(props.index, props.editEntry)}
            aria-label="Save entry"
            className="focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none"
          >
            <Check aria-hidden="true" className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            type="button"
            onClick={props.onCancel}
            aria-label="Cancel edit"
            className="focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none"
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        </td>
      );
    }

    // mode === 'new'
    return (
      <td role="gridcell" className="p-2 text-right">
        <Button
          variant="icon"
          size="icon"
          type="button"
          onClick={props.onAdd}
          aria-label="Add expense"
          className="focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none"
        >
          <Plus aria-hidden="true" className="size-4" />
        </Button>
      </td>
    );
  };

  return (
    <tr role="row" className="border-t">
      {renderDescriptionCell()}
      {renderCategoryCell()}
      {renderAmountCell()}
      {renderActionCell()}
    </tr>
  );
}
