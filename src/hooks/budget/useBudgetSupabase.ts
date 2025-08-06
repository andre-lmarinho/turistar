// src/hooks/budget/useBudgetSupabase.ts
import { useState, useMemo, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import type { CategoryKey } from '@/constants';
import type { Entry } from '@/types/budget';

export function useBudget(planId: string, activitiesTotal: number) {
  const [budget, setBudget] = useState(0);
  const [entries, setEntries] = useState<Entry[]>([]);

  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState<CategoryKey>('transport');
  const [amount, setAmount] = useState(0);

  const [hasLoaded, setHasLoaded] = useState(false);
  const hasLoadedRef = useRef(false);
  const [persistError, setPersistError] = useState<string | null>(null);
  const sb: SupabaseClient<Database> = supabase;

  useEffect(() => {
    hasLoadedRef.current = false;
    setHasLoaded(false);
    const load = async () => {
      const budgetRes = (await sb
        .from('budget')
        .select('budget')
        .eq('plan_id', planId)
        .single()) as unknown as { data: { budget: number | null } | null };
      const entryRes = (await sb
        .from('budget_entries')
        .select('description, category, amount')
        .eq('plan_id', planId)) as unknown as {
        data:
          | { description: string | null; category: string | null; amount: number | null }[]
          | null;
      };
      if (budgetRes.data) {
        setBudget(budgetRes.data.budget ?? 0);
      }
      setEntries(
        entryRes.data?.map((e) => ({
          description: e.description ?? '',
          category: (e.category as CategoryKey) ?? 'transport',
          amount: e.amount ?? 0,
        })) ?? []
      );
      hasLoadedRef.current = true;
      setHasLoaded(true);
    };
    void load();
  }, [planId, sb]);

  useEffect(() => {
    if (!hasLoadedRef.current) return;
    const persist = async () => {
      setPersistError(null);
      const { error: budgetError } = (await sb
        .from('budget')
        .upsert({ plan_id: planId, budget }, { onConflict: 'plan_id' })) as unknown as {
        error: unknown;
      };
      if (budgetError) {
        setPersistError('Failed to persist budget');
        return;
      }

      const { error: deleteError } = (await sb
        .from('budget_entries')
        // @ts-expect-error Supabase typings omit delete, but runtime supports it
        .delete()
        .eq('plan_id', planId)) as unknown as { error: unknown };
      if (deleteError) {
        setPersistError('Failed to persist budget');
        return;
      }

      if (entries.length > 0) {
        const rows = entries.map((e) => ({ plan_id: planId, ...e }));
        const { error: insertError } = (await sb
          .from('budget_entries')
          .insert(rows)) as unknown as { error: unknown };
        if (insertError) {
          setPersistError('Failed to persist budget');
        }
      }
    };
    void persist();
  }, [planId, budget, entries, hasLoaded, sb]);

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
