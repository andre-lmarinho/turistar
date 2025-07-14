// src/hooks/useBudget.ts

import { useState, useMemo } from 'react';
import type { CategoryKey } from '@/constants';
import type { Entry } from '@/types/budget';

/**
 * Manages travel budget state, including total, expenses, and category breakdowns.
 * Provides controlled inputs and handlers for adding, editing, and removing entries.
 * Accepts an initial value for the "Tours & Activities" category.
 */

export function useBudget(activitiesTotal: number) {
  const [budget, setBudget] = useState(0);
  const [entries, setEntries] = useState<Entry[]>([]);

  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState<CategoryKey>('transport');
  const [amount, setAmount] = useState(0);

  const categoryTotals = useMemo(() => {
    const totals: Record<CategoryKey, number> = {
      transport: 0,
      lodging: 0,
      food: 0,
      activities: activitiesTotal,
      shopping: 0,
      documents: 0,
    };
    for (const e of entries) {
      totals[e.category] += e.amount;
    }
    return totals;
  }, [entries, activitiesTotal]);

  const totalSpent = useMemo(
    () => Object.values(categoryTotals).reduce((s, n) => s + n, 0),
    [categoryTotals]
  );

  const handleAdd = () => {
    if (!desc || amount <= 0) return;
    setEntries((prev) => [...prev, { description: desc, category: cat, amount }]);
    setDesc('');
    setAmount(0);
  };

  const handleUpdateEntry = (index: number, updated: Entry) => {
    setEntries((prev) => {
      const copy = [...prev];
      copy[index] = updated;
      return copy;
    });
  };

  const handleDeleteEntry = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  return {
    budget,
    setBudget,
    entries,
    categoryTotals,
    totalSpent,
    difference: budget - totalSpent,

    desc,
    setDesc,
    cat,
    setCat,
    amount,
    setAmount,

    handleAdd,
    handleUpdateEntry,
    handleDeleteEntry,
  };
}
