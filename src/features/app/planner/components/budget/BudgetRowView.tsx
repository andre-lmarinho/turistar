'use client';

import React from 'react';
import { Pencil, Trash2 } from '@/shared/ui/icon';
import type { Entry } from '@/features/app/planner/types/budget';
import { CATEGORIES } from '@/features/app/planner/domain/constants/budget';

type BudgetRowViewProps = {
  index: number;
  entry: Entry;
  onEdit: (index: number) => void;
  onDelete?: (index: number) => void;
  canEdit?: boolean;
};

export function BudgetRowView({
  index,
  entry,
  onEdit,
  onDelete,
  canEdit = true,
}: BudgetRowViewProps) {
  return (
    <tr role="row" className="border-t">
      <th scope="row" role="gridcell" className="p-2 text-left font-medium">
        {entry.description}
      </th>
      <td role="gridcell" className="p-2">
        {CATEGORIES.find((category) => category.key === entry.category)?.label}
      </td>
      <td
        role="gridcell"
        className="p-2 text-right"
        aria-label={`Amount: $${entry.amount.toFixed(2)}`}
      >
        {'$' + entry.amount.toFixed(2)}
      </td>
      <td role="gridcell" className="flex justify-end gap-2 p-2 text-right">
        <button
          type="button"
          onClick={() => onEdit(index)}
          aria-label="Edit entry"
          className="border-border bg-background text-muted-foreground hover:bg-muted/60 hover:text-foreground inline-flex size-8 cursor-pointer items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!canEdit}
        >
          <Pencil className="size-4" aria-hidden="true" />
        </button>
        {onDelete ? (
          <button
            type="button"
            onClick={() => onDelete(index)}
            aria-label="Delete entry"
            className="border-border bg-background text-muted-foreground hover:bg-muted/60 hover:text-foreground inline-flex size-8 cursor-pointer items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!canEdit}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </td>
    </tr>
  );
}
