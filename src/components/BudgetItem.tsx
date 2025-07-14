// src/app/planner/BudgetItem.tsx
'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface BudgetItemProps {
  id: string;
  icon: LucideIcon;
  label: string;
  amount: number;
  editable?: boolean;
  onChange?: (value: number) => void;
}

export default function BudgetItem({
  id,
  icon: Icon,
  label,
  amount,
  editable = true,
  onChange,
}: BudgetItemProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(Number(e.target.value));
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <label htmlFor={id} className="flex items-center gap-2 font-medium">
        <Icon aria-hidden="true" className="size-4" />
        {label}
      </label>
      {editable ? (
        <input
          id={id}
          type="number"
          min={0}
          value={amount}
          onChange={handleChange}
          className="w-32 border rounded px-2 py-1 text-right"
        />
      ) : (
        <span id={id} className="w-32 text-right">
          ${amount.toFixed(2)}
        </span>
      )}
    </div>
  );
}
