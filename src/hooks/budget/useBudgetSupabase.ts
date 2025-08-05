// src/hooks/budget/useBudgetSupabase.ts
import { useState, useMemo, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { CategoryKey } from '@/constants';
import type { Entry } from '@/types/budget';
import type { Database } from '@/types/supabase';

type BudgetTableRow = Database['public']['Tables']['budget']['Row'];

export function useBudget(planId: string, activitiesTotal: number) {
  const [budget, setBudget] = useState(0);
  const [entries, setEntries] = useState<Entry[]>([]);

  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState<CategoryKey>('transport');
  const [amount, setAmount] = useState(0);

  const [hasLoaded, setHasLoaded] = useState(false);
  const hasLoadedRef = useRef(false);
  const [persistError, setPersistError] = useState<string | null>(null);

  useEffect(() => {
    hasLoadedRef.current = false;
    setHasLoaded(false);
    const load = async () => {
      const sb = supabase as any;
      const { data } = (await sb
        .from('budget')
        .select('budget, entries')
        .eq('plan_id', planId)
        .single()) as { data: BudgetTableRow | null };
      if (data) {
        setBudget(data.budget ?? 0);
        setEntries((data.entries as Entry[] | null) ?? []);
      }
      hasLoadedRef.current = true;
      setHasLoaded(true);
    };
    void load();
  }, [planId]);

  useEffect(() => {
    if (!hasLoadedRef.current) return;
    const persist = async () => {
      setPersistError(null);
      const sb = supabase as any;
      const { error } = (await sb
        .from('budget')
        .upsert({ plan_id: planId, budget, entries }, { onConflict: 'plan_id' })) as {
        error: unknown;
      };
      if (error) {
        setPersistError('Failed to persist budget');
      }
    };
    void persist();
  }, [planId, budget, entries, hasLoaded]);

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
    persistError,
    hasLoaded,

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

export { useBudget as useBudgetSupabase };
