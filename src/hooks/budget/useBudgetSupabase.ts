// src/hooks/budget/useBudgetSupabase.ts
import { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { CategoryKey } from '@/constants';
import type { Entry } from '@/types/budget';

interface BudgetRow {
  plan_id: string;
  budget: number;
  entries: Entry[];
}

export function useBudget(planId: string, activitiesTotal: number) {
  const [budget, setBudget] = useState(0);
  const [entries, setEntries] = useState<Entry[]>([]);

  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState<CategoryKey>('transport');
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    supabase
      .from('budget_entries')
      .select('budget, entries')
      .eq('plan_id', planId)
      .single()
      .then(({ data }) => {
        const row = data as BudgetRow | null;
        if (row) {
          setBudget(row.budget ?? 0);
          setEntries(row.entries ?? []);
        }
      });
  }, [planId]);

  useEffect(() => {
    supabase.from('budget_entries').upsert({ plan_id: planId, budget, entries });
  }, [planId, budget, entries]);

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
