import React from 'react';
import { CATEGORIES, CategoryKey } from '@/features/planner/domain/constants/budget';
import { Input } from '@/shared/ui/input';
import { DollarSign } from '@/shared/ui/icon';
import type { UseBudgetRowInputsResult } from '../../hooks/ui/useBudgetRowInputs';

export function BudgetRowInputs({
  description,
  category,
  amount,
  amountCellClassName,
}: UseBudgetRowInputsResult) {
  return (
    <>
      <td role="gridcell" className="p-2">
        <label htmlFor={description.id} className="sr-only">
          {description.ariaLabel ?? 'Description'}
        </label>
        <input
          id={description.id}
          name="description"
          value={description.value}
          autoComplete="off"
          autoFocus={description.autoFocus}
          placeholder={description.placeholder}
          onChange={(event) => description.onChange(event.target.value)}
          aria-label={description.ariaLabel ?? 'Description'}
          className="focus:ring-primary w-full rounded border px-2 py-1 focus:ring-2 focus:ring-offset-2 focus:outline-none"
        />
      </td>
      <td role="gridcell" className="p-2">
        <label htmlFor={category.id} className="sr-only">
          {category.ariaLabel ?? 'Category'}
        </label>
        <select
          id={category.id}
          name="category"
          value={category.value}
          onChange={(event) => category.onChange(event.target.value as CategoryKey)}
          aria-label={category.ariaLabel ?? 'Category'}
          className="focus:ring-primary w-full rounded border px-2 py-1 focus:ring-2 focus:ring-offset-2 focus:outline-none"
        >
          {CATEGORIES.map(({ key, label }) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </td>
      <td role="gridcell" className={amountCellClassName}>
        <label htmlFor={amount.id} className="sr-only">
          {amount.ariaLabel ?? 'Amount'}
        </label>
        <Input
          id={amount.id}
          value={amount.value}
          onValueChange={amount.onValueChange}
          onBlur={amount.onBlur}
          inputSize="default"
          background="default"
          inputMode="decimal"
          autoComplete="off"
          placeholder={amount.placeholder}
          aria-label={amount.ariaLabel ?? 'Amount'}
          icon={<DollarSign aria-hidden="true" className="text-muted-foreground size-4" />}
          className="focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none"
        />
      </td>
    </>
  );
}
