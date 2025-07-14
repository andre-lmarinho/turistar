// src/app/planner/BudgetPanel.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { Bus, Hotel, Utensils, Ticket, ShoppingCart, FileText } from 'lucide-react';
import { BudgetItem } from '@/components';

interface Props {
  activitiesTotal: number;
}
interface BudgetValues {
  transport: number;
  lodging: number;
  food: number;
  activities: number;
  shopping: number;
  documents: number;
}

const CATEGORIES = [
  { key: 'transport', label: 'Transportation', icon: Bus },
  { key: 'lodging', label: 'Lodging', icon: Hotel },
  { key: 'food', label: 'Food', icon: Utensils },
  { key: 'activities', label: 'Tours & Activities', icon: Ticket },
  { key: 'shopping', label: 'Shopping & Extras', icon: ShoppingCart },
  { key: 'documents', label: 'Documents & Fees', icon: FileText },
] as const;
type CategoryKey = (typeof CATEGORIES)[number]['key'];

export default function BudgetPanel({ activitiesTotal }: Props) {
  const [values, setValues] = useState<BudgetValues>({
    transport: 0,
    lodging: 0,
    food: 0,
    activities: 0,
    shopping: 0,
    documents: 0,
  });

  const total = useMemo(
    () =>
      values.transport +
      values.lodging +
      values.food +
      values.activities +
      values.shopping +
      values.documents +
      activitiesTotal,
    [values, activitiesTotal]
  );

  const handleChange = (key: CategoryKey) => (value: number) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-4 md:mb-10 bg-background flex flex-col flex-1 w-full gap-4 overflow-x-auto h-full rounded-xl border">
      <div className="pb-4 flex justify-between">
        <h2 className="text-3xl font-semibold">Traveling Budget</h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {CATEGORIES.map(({ key, label, icon }) =>
          key === 'activities' ? (
            <div
              key={key}
              className="flex items-center justify-between gap-4 border rounded-lg p-3 bg-muted"
            >
              <div className="flex items-center gap-2">
                {React.createElement(icon, { size: 16 })}
                <span className="font-medium">{label}</span>
              </div>
              <span>${activitiesTotal.toFixed(2)}</span>
            </div>
          ) : (
            <BudgetItem
              key={key}
              id={`budget-${key}`}
              icon={icon}
              label={label}
              amount={values[key]}
              onChange={handleChange(key)}
            />
          )
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t font-bold text-lg">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </div>
  );
}
