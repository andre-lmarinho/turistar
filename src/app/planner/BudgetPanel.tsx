// src/app/planner/BudgetPanel.tsx
'use client';

import React, { useState, useMemo } from 'react';

interface BudgetValues {
  transport: number;
  lodging: number;
  food: number;
  activities: number;
  shopping: number;
  documents: number;
}

export default function BudgetPanel() {
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
      values.documents,
    [values]
  );

  const handleChange = (key: keyof BudgetValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    setValues((prev) => ({ ...prev, [key]: num }));
  };

  const renderInput = (label: string, key: keyof BudgetValues) => (
    <div className="flex items-center justify-between gap-4">
      <label className="font-medium">{label}</label>
      <input
        type="number"
        min={0}
        value={values[key]}
        onChange={handleChange(key)}
        className="w-32 border rounded px-2 py-1 text-right"
      />
    </div>
  );

  return (
    <div className="space-y-4 p-4 bg-background rounded-xl border max-w-md">
      {renderInput('Transportation', 'transport')}
      {renderInput('Lodging', 'lodging')}
      {renderInput('Food', 'food')}
      {renderInput('Tours & Activities', 'activities')}
      {renderInput('Shopping & Extras', 'shopping')}
      {renderInput('Documents & Fees', 'documents')}
      <div className="flex items-center justify-between pt-2 border-t font-semibold">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </div>
  );
}
