import { useState, useMemo, useEffect, useRef } from 'react';
import { supabase } from '@/shared/lib/supabaseClient';
import type { CategoryKey } from '@/features/planner/domain/constants/budget';
import type { Entry } from '@/features/planner/types/budget/budget';
import { usePlanResource } from '@/features/planner/hooks/internal/usePlanResource';

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

  const { data: loaded } = usePlanResource<{ budget: number; entries: Entry[] }>({
    planId,
    resource: 'budget',
    fetcher: async (id) => {
      const budgetRes = (await supabase
        .from('plans')
        .select('budget')
        .eq('id', id)
        .single()) as unknown as { data: { budget: number | null } | null };
      const entryRes = (await supabase
        .from('budget_entries')
        .select('*')
        .eq('plan_id', id)) as unknown as {
        data:
          | {
              id: string;
              description: string | null;
              category: string | null;
              amount: number | null;
            }[]
          | null;
      };
      return {
        budget: budgetRes.data?.budget ?? 0,
        entries:
          entryRes.data?.map((e) => ({
            id: e.id,
            description: e.description ?? '',
            category: (e.category as CategoryKey) ?? 'transport',
            amount: e.amount ?? 0,
          })) ?? [],
      };
    },
    enabled: persist,
  });

  const { mutate: saveBudget } = usePlanResource<number, number>({
    planId,
    resource: 'budget',
    table: 'plans',
    column: 'budget',
    onSuccess: (b) => {
      initialBudgetRef.current = b as number;
    },
    onError: () => setPersistError('Failed to persist budget'),
  });

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
    if (loaded) {
      setBudget(loaded.budget);
      initialBudgetRef.current = loaded.budget;
      setEntries(loaded.entries);
      hasLoadedRef.current = true;
      setHasLoaded(true);
    }
  }, [persist, initialBudget, initialEntries, loaded]);

  useEffect(() => {
    if (!persist) return;
    if (!hasLoadedRef.current) return;
    if (budget === initialBudgetRef.current) return;
    setPersistError(null);
    saveBudget(budget);
  }, [budget, planId, persist, saveBudget]);

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

  const { mutateAsync: addEntryMut } = usePlanResource<
    string,
    {
      description: string;
      category: CategoryKey;
      amount: number;
    }
  >({
    planId,
    resource: 'budget',
    persistFn: async (id, payload) => {
      const res = (await supabase
        .from('budget_entries')
        .insert({
          plan_id: id,
          description: payload.description,
          category: payload.category,
          amount: payload.amount,
        })
        .select('id')
        .single()) as unknown as {
        data: { id: string } | null;
        error: unknown;
      };
      if (res.error || !res.data) throw res.error;
      return res.data.id;
    },
    onError: () => setPersistError('Failed to persist budget'),
  });

  const handleAdd = async () => {
    if (!desc || amount <= 0) return;
    setPersistError(null);
    if (persist) {
      try {
        const newId = (await addEntryMut({
          description: desc,
          category: cat,
          amount,
        })) as string;
        setEntries((prev) => [...prev, { id: newId, description: desc, category: cat, amount }]);
      } catch {
        return;
      }
    } else {
      const newId = crypto.randomUUID();
      setEntries((prev) => [...prev, { id: newId, description: desc, category: cat, amount }]);
    }
    setDesc('');
    setAmount(0);
  };

  const { mutateAsync: updateEntryMut } = usePlanResource<void, Entry>({
    planId,
    resource: 'budget',
    persistFn: async (_id, updated) => {
      const { error } = (await supabase
        .from('budget_entries')
        .update({
          description: updated.description,
          category: updated.category,
          amount: updated.amount,
        })
        .eq('id', updated.id)) as unknown as { error: unknown };
      if (error) throw error;
    },
    onError: () => setPersistError('Failed to persist budget'),
  });

  const handleUpdateEntry = async (index: number, updated: Entry) => {
    setEntries((prev) => {
      const copy = [...prev];
      copy[index] = updated;
      return copy;
    });
    if (!persist) return;
    await updateEntryMut(updated);
  };

  const { mutateAsync: deleteEntryMut } = usePlanResource<void, string>({
    planId,
    resource: 'budget',
    persistFn: async (_id, id) => {
      const { error } = (await supabase
        .from('budget_entries')
        // @ts-expect-error Supabase typings omit delete, but runtime supports it
        .delete()
        .eq('id', id)) as unknown as { error: unknown };
      if (error) throw error;
    },
    onError: () => setPersistError('Failed to persist budget'),
  });

  const handleDeleteEntry = async (index: number) => {
    const entry = entries[index];
    setEntries((prev) => prev.filter((_, i) => i !== index));
    if (!persist) return;
    await deleteEntryMut(entry.id);
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
