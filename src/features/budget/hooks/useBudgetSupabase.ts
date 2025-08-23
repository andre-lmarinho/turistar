// src/features/budget/hooks/useBudgetSupabase.ts
import { useState, useMemo, useEffect, useRef } from 'react';
import { supabase } from '@/shared/lib/supabaseClient';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/types/supabase';
import type { CategoryKey } from '@/shared/constants';
import type { Entry } from '@/features/budget/types';

export function useBudget(
  planId: string,
  activitiesTotal: number,
  options: { initialBudget?: number; initialEntries?: Entry[]; persist?: boolean } = {}
) {
  const { initialBudget = 0, initialEntries, persist = true } = options;
  const [budget, setBudget] = useState(initialBudget);
  const [entries, setEntries] = useState<Entry[]>(initialEntries ?? []);

  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState<CategoryKey>('transport');
  const [amount, setAmount] = useState(0);

  const [hasLoaded, setHasLoaded] = useState(false);
  const hasLoadedRef = useRef(false);
  const initialBudgetRef = useRef(0);
  const [persistError, setPersistError] = useState<string | null>(null);
  const sb: SupabaseClient<Database> = supabase;

  useEffect(() => {
    hasLoadedRef.current = false;
    setHasLoaded(false);
    if (!persist) {
      initialBudgetRef.current = initialBudget;
      setBudget(initialBudget);
      setEntries(initialEntries ?? []);
      hasLoadedRef.current = true;
      setHasLoaded(true);
      return;
    }
    const load = async () => {
      const budgetRes = (await sb
        .from('plans')
        .select('budget')
        .eq('id', planId)
        .single()) as unknown as { data: { budget: number | null } | null };
      const entryRes = (await sb
        .from('budget_entries')
        .select('*')
        .eq('plan_id', planId)) as unknown as {
        data:
          | {
              id: string;
              description: string | null;
              category: string | null;
              amount: number | null;
            }[]
          | null;
      };
      const loadedBudget = budgetRes.data?.budget ?? 0;
      setBudget(loadedBudget);
      initialBudgetRef.current = loadedBudget;
      setEntries(
        entryRes.data?.map((e) => ({
          id: e.id,
          description: e.description ?? '',
          category: (e.category as CategoryKey) ?? 'transport',
          amount: e.amount ?? 0,
        })) ?? []
      );
      hasLoadedRef.current = true;
      setHasLoaded(true);
    };
    void load();
  }, [planId, sb, persist, initialBudget, initialEntries]);

  useEffect(() => {
    if (!persist) return;
    if (!hasLoadedRef.current) return;
    if (budget === initialBudgetRef.current) return;
    const persistBudget = async () => {
      setPersistError(null);
      const { error } = (await sb.from('plans').update({ budget }).eq('id', planId)) as unknown as {
        error: unknown;
      };
      if (error) {
        setPersistError('Failed to persist budget');
        return;
      }
      initialBudgetRef.current = budget;
    };
    void persistBudget();
  }, [planId, budget, hasLoaded, sb, persist]);

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

  const handleAdd = async () => {
    if (!desc || amount <= 0) return;
    setPersistError(null);
    if (persist) {
      const res = (await sb
        .from('budget_entries')
        .insert({ plan_id: planId, description: desc, category: cat, amount })
        .select('id')
        .single()) as unknown as { data: { id: string } | null; error: unknown };
      if (res.error || !res.data) {
        setPersistError('Failed to persist budget');
        return;
      }
      const newId = res.data!.id;
      setEntries((prev) => [...prev, { id: newId, description: desc, category: cat, amount }]);
    } else {
      const newId = crypto.randomUUID();
      setEntries((prev) => [...prev, { id: newId, description: desc, category: cat, amount }]);
    }
    setDesc('');
    setAmount(0);
  };

  const handleUpdateEntry = async (index: number, updated: Entry) => {
    setEntries((prev) => {
      const copy = [...prev];
      copy[index] = updated;
      return copy;
    });
    if (!persist) return;
    const { error } = (await sb
      .from('budget_entries')
      .update({
        description: updated.description,
        category: updated.category,
        amount: updated.amount,
      })
      .eq('id', updated.id)) as unknown as { error: unknown };
    if (error) {
      setPersistError('Failed to persist budget');
    }
  };

  const handleDeleteEntry = async (index: number) => {
    const entry = entries[index];
    setEntries((prev) => prev.filter((_, i) => i !== index));
    if (!persist) return;
    const { error } = (await sb
      .from('budget_entries')
      // @ts-expect-error Supabase typings omit delete, but runtime supports it
      .delete()
      .eq('id', entry.id)) as unknown as { error: unknown };
    if (error) {
      setPersistError('Failed to persist budget');
    }
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
