// src/features/planner/components/budget/BudgetRow.tsx
'use client';

import React, { useId } from 'react';
import { CATEGORIES, CategoryKey } from '@/features/planner/domain/constants/budget';
import { normalizeAmount } from '@/shared/utils/normalizeAmount';
import { useBudgetContext } from '@/features/planner/hooks/budget/BudgetContext';
import type { Entry } from '@/features/planner/types/budget/budget';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

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
    const placeholder = props.mode === 'new' ? 'Description' : undefined;
    const autoFocus = props.mode === 'edit';

    return (
      <td role="gridcell" className="p-2">
        <label htmlFor={`description-${baseId}`} className="sr-only">
          Description
        </label>
        <Input
          labelId={`description-${baseId}`}
          id={`description-${baseId}`}
          name="description"
          value={value}
          autoComplete="off"
          autoFocus={autoFocus}
          placeholder={placeholder}
          onValueChange={(val) =>
            props.mode === 'edit'
              ? props.setEditEntry((prev) => prev && { ...prev, description: val })
              : setDesc(val)
          }
          aria-label="Description"
          align="left"
          inputSize="full"
          tone="ringed"
          density="default"
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
            icon="dollar-sign"
            tone="ringed"
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
          icon="dollar-sign"
          tone="ringed"
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
            icon="pencil"
            iconProps={{ className: 'size-4' }}
          />
          {props.onDelete && (
            <Button
              size="icon"
              variant="ghost"
              type="button"
              onClick={() => props.onDelete && props.onDelete(props.index)}
              aria-label="Delete entry"
              className="focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none"
              icon="trash-2"
              iconProps={{ className: 'size-4' }}
            />
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
            icon="check"
            iconProps={{ className: 'size-4' }}
          />
          <Button
            size="icon"
            variant="ghost"
            type="button"
            onClick={props.onCancel}
            aria-label="Cancel edit"
            className="focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none"
            icon="x"
            iconProps={{ className: 'size-4' }}
          />
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
          icon="plus"
          iconProps={{ className: 'size-4' }}
        />
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
