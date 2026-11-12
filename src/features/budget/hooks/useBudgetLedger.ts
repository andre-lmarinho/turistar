"use client";

import { useRef, useState } from "react";

import { trpc } from "@/trpc/react";

import type { BudgetQueryResult, Entry } from "../types";

type ExpenseInput = Omit<Entry, "id"> & { id?: string };

const EMPTY_ENTRIES: Entry[] = [];

export function useBudgetLedger(planId: string, initialEntries?: Entry[]) {
  const [saveFailed, setSaveFailed] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const writePending = useRef(false);
  const utils = trpc.useUtils();
  const cache = utils.viewer.budget.get;
  const query = trpc.viewer.budget.get.useQuery(
    { planId },
    { initialData: { budget: 0, entries: initialEntries ?? EMPTY_ENTRIES } }
  );
  const createEntry = trpc.viewer.budget.createEntry.useMutation();
  const updateEntry = trpc.viewer.budget.updateEntry.useMutation();
  const deleteEntry = trpc.viewer.budget.deleteEntry.useMutation();

  const saveEntry = async (entry: ExpenseInput) => {
    if (writePending.current) return false;
    writePending.current = true;
    setIsWriting(true);
    let previous: BudgetQueryResult | undefined;
    setSaveFailed(false);
    try {
      await cache.cancel({ planId });
      previous = cache.getData({ planId });
      if (entry.id) {
        const updated = { ...entry, id: entry.id };
        cache.setData(
          { planId },
          (current) =>
            current && {
              ...current,
              entries: current.entries.map((item) => (item.id === updated.id ? updated : item)),
            }
        );
        await updateEntry.mutateAsync({ entry: updated });
      } else {
        const id = await createEntry.mutateAsync({ planId, payload: entry });
        cache.setData(
          { planId },
          (current) => current && { ...current, entries: [...current.entries, { ...entry, id }] }
        );
      }
      return true;
    } catch {
      if (previous) cache.setData({ planId }, previous);
      setSaveFailed(true);
      return false;
    } finally {
      writePending.current = false;
      setIsWriting(false);
      void cache.invalidate({ planId });
    }
  };

  const removeEntry = async (entryId: string) => {
    if (writePending.current) return;
    writePending.current = true;
    setIsWriting(true);
    let previous: BudgetQueryResult | undefined;
    setSaveFailed(false);
    try {
      await cache.cancel({ planId });
      previous = cache.getData({ planId });
      cache.setData(
        { planId },
        (current) => current && { ...current, entries: current.entries.filter((item) => item.id !== entryId) }
      );
      await deleteEntry.mutateAsync({ entryId });
    } catch {
      if (previous) cache.setData({ planId }, previous);
      throw new Error(`Unable to delete expense ${entryId}`);
    } finally {
      writePending.current = false;
      setIsWriting(false);
      void cache.invalidate({ planId });
    }
  };

  return {
    ...query,
    saveFailed,
    saveEntry,
    removeEntry,
    isPending: isWriting || createEntry.isPending || updateEntry.isPending || deleteEntry.isPending,
  };
}
