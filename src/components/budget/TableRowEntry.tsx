// src/components/budget/TableRowEntry.tsx
'use client';

import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components';
import { CATEGORIES } from '@/constants';
import type { Entry } from '@/types';

export default function TableRowEntry({
  entry,
  index,
  onEdit,
  onDelete,
}: {
  entry: Entry;
  index: number;
  onEdit: (index: number) => void;
  onDelete?: (index: number) => void;
}) {
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
