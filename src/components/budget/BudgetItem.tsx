// src/components/budget/BudgetItem.tsx
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
    <div
      role="group"
      aria-labelledby={`${id}-label`}
      className="flex items-center justify-between gap-4"
    >
      <label id={`${id}-label`} htmlFor={id} className="flex items-center gap-2 font-medium">
        <Icon aria-hidden="true" className="size-4" />
        {label}
      </label>

      {editable ? (
        <input
          id={id}
          role="spinbutton"
          aria-labelledby={`${id}-label`}
          type="number"
          inputMode="decimal"
          min={0}
          aria-valuemin={0}
          aria-valuemax={Number.POSITIVE_INFINITY}
          aria-valuenow={amount}
          value={amount}
          onChange={handleChange}
          className="focus:ring-primary w-32 rounded border px-2 py-1 text-right focus:ring-2 focus:ring-offset-2 focus:outline-none"
        />
      ) : (
        <span
          role="text"
          aria-label={`${label}: $${amount.toFixed(2)}`}
          className="w-32 text-right"
        >
          {'$' + amount.toFixed(2)}
        </span>
      )}
    </div>
  );
}
