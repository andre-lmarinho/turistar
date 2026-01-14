import { useEffect, useRef } from "react";

import type { CategoryKey } from "@/features/app/planner/domain/constants/budget";
import { CATEGORIES } from "@/features/app/planner/domain/constants/budget";
import type { UseBudgetRowInputsResult } from "@/features/app/planner/hooks/ui/useBudgetRowInputs";
import { DollarSign } from "@/shared/ui/icon";

const isValidCategoryKey = (value: string): value is CategoryKey =>
  CATEGORIES.some(({ key }) => key === value);

export function BudgetRowInputs({
  description,
  category,
  amount,
  amountCellClassName,
}: UseBudgetRowInputsResult) {
  const descriptionRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!description.autoFocus) return;
    descriptionRef.current?.focus();
  }, [description.autoFocus]);

  return (
    <>
      <td className="p-2">
        <label htmlFor={description.id} className="sr-only">
          {description.ariaLabel ?? "Description"}
        </label>
        <input
          ref={descriptionRef}
          id={description.id}
          name="description"
          value={description.value}
          autoComplete="off"
          placeholder={description.placeholder}
          onChange={(event) => description.onChange(event.target.value)}
          aria-label={description.ariaLabel ?? "Description"}
          className="focus:ring-primary w-full rounded border px-2 py-1 focus:ring-2 focus:ring-offset-2 focus:outline-none"
        />
      </td>
      <td className="p-2">
        <label htmlFor={category.id} className="sr-only">
          {category.ariaLabel ?? "Category"}
        </label>
        <select
          id={category.id}
          name="category"
          value={category.value}
          onChange={(event) => {
            const value = event.target.value;
            if (isValidCategoryKey(value)) category.onChange(value);
          }}
          aria-label={category.ariaLabel ?? "Category"}
          className="focus:ring-primary w-full rounded border px-2 py-1 focus:ring-2 focus:ring-offset-2 focus:outline-none">
          {CATEGORIES.map(({ key, label }) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </td>
      <td className={amountCellClassName}>
        <label htmlFor={amount.id} className="sr-only">
          {amount.ariaLabel ?? "Amount"}
        </label>
        <div className="bg-background grid grid-cols-[auto_1fr] items-center overflow-hidden rounded border">
          <span className="bg-muted border-r">
            <DollarSign aria-hidden="true" className="text-muted-foreground m-2 size-4" />
          </span>
          <input
            id={amount.id}
            value={amount.value}
            onChange={(event) => amount.onValueChange(event.target.value)}
            onBlur={amount.onBlur}
            inputMode="decimal"
            autoComplete="off"
            placeholder={amount.placeholder}
            aria-label={amount.ariaLabel ?? "Amount"}
            className="focus:ring-primary w-full bg-transparent px-2 py-1 text-right outline-none focus:ring-2 focus:ring-offset-2"
          />
        </div>
      </td>
    </>
  );
}
