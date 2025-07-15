// src/components/budget/TableRowEntry.tsx
'use client';

import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components';
import { CATEGORIES } from '@/constants';
import type { Entry } from '@/types';

export function TableRowEntry({
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
    <tr className="border-t">
      <td className="p-2">{entry.description}</td>
      <td className="p-2">{CATEGORIES.find((c) => c.key === entry.category)?.label}</td>
      <td className="p-2 text-right">${entry.amount.toFixed(2)}</td>
      <td className="p-2 text-right flex gap-2 justify-end">
        <Button size="icon" variant="ghost" onClick={() => onEdit(index)} title="Edit">
          <Pencil className="size-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => onDelete?.(index)} title="Delete">
          <Trash2 className="size-4" />
        </Button>
      </td>
    </tr>
  );
}
