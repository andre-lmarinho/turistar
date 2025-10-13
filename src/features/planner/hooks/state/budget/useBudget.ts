import { useState, useMemo, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabaseClient';
import type { CategoryKey } from '@/features/planner/domain/constants/budget';
import type { Entry } from '@/features/planner/types/budget';

type BudgetQueryResult = { budget: number; entries: Entry[] };

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
  const qc = useQueryClient();

  const queryKey = ['budget', planId] as const;

  const budgetQuery = useQuery<BudgetQueryResult, Error, BudgetQueryResult, typeof queryKey>({
    queryKey,
    enabled: persist,
    queryFn: async (): Promise<BudgetQueryResult> => {
      const budgetRes = (await supabase
        .from('plans')
        .select('budget')
        .eq('id', planId)
        .single()) as unknown as { data: { budget: number | null } | null; error: unknown };
      const entryRes = (await supabase
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
        error: unknown;
      };

      if (budgetRes.error) throw budgetRes.error;
      if (entryRes.error) throw entryRes.error;

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
  });
  const loaded = budgetQuery.data as BudgetQueryResult | undefined;

  const saveBudgetMutation = useMutation({
    mutationFn: async (newBudget: number) => {
      const { data, error } = (await supabase
        .from('plans')
        .update({ budget: newBudget })
        .eq('id', planId)
        .select('budget')
        .single()) as { data: { budget: number | null } | null; error: unknown };
      if (error) throw error;
      return (data?.budget ?? newBudget) as number;
    },
    onSuccess: (b: number) => {
      initialBudgetRef.current = b;
      qc.setQueryData<BudgetQueryResult>(queryKey, (prev) =>
        prev ? { ...prev, budget: b } : { budget: b, entries: [] }
      );
    },
    onError: () => setPersistError('Failed to persist budget'),
  });
  const saveBudget = saveBudgetMutation.mutate;

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
      const loadedData = loaded as BudgetQueryResult;
      setBudget(loadedData.budget);
      initialBudgetRef.current = loadedData.budget;
      setEntries(loadedData.entries);
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
  }, [budget, persist, saveBudget]);

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

  const addEntryMutation = useMutation({
    mutationFn: async (payload: { description: string; category: CategoryKey; amount: number }) => {
      const res = (await supabase
        .from('budget_entries')
        .insert({
          plan_id: planId,
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
      qc.invalidateQueries({ queryKey });
      return res.data.id;
    },
    onError: () => setPersistError('Failed to persist budget'),
  });
  const addEntryMut = addEntryMutation.mutateAsync;

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

  const updateEntryMutation = useMutation({
    mutationFn: async (updated: Entry) => {
      const { error } = (await supabase
        .from('budget_entries')
        .update({
          description: updated.description,
          category: updated.category,
          amount: updated.amount,
        })
        .eq('id', updated.id)) as unknown as { error: unknown };
      if (error) throw error;
      qc.invalidateQueries({ queryKey });
    },
    onError: () => setPersistError('Failed to persist budget'),
  });
  const updateEntryMut = updateEntryMutation.mutateAsync;

  const handleUpdateEntry = async (index: number, updated: Entry) => {
    setEntries((prev) => {
      const copy = [...prev];
      copy[index] = updated;
      return copy;
    });
    if (!persist) return;
    await updateEntryMut(updated);
  };

  const deleteEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = (await supabase
        .from('budget_entries')
        // @ts-expect-error Supabase typings omit delete, but runtime supports it
        .delete()
        .eq('id', id)) as unknown as { error: unknown };
      if (error) throw error;
      qc.invalidateQueries({ queryKey });
    },
    onError: () => setPersistError('Failed to persist budget'),
  });
  const deleteEntryMut = deleteEntryMutation.mutateAsync;

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
