// src/features/planner/hooks/usePersistedPlannerDays.ts
'use client';
import { useCallback, useEffect, useRef } from 'react';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { DayPlan } from '@/shared/types';
import type { usePlanner } from './usePlanner';

interface PersistDaysMutation {
  mutateAsync: (state: DayPlan[]) => Promise<unknown>;
  isPending: boolean;
}

interface UsePersistedPlannerDaysParams {
  planner: Pick<ReturnType<typeof usePlanner>, 'days' | 'setDays'>;
  persistDays: PersistDaysMutation;
  persist?: boolean;
  storedDays?: DayPlan[] | undefined;
}

/** Keeps planner days synced with Supabase, including debounce, rollback, and lifecycle flushes. */
export function usePersistedPlannerDays({
  planner,
  persistDays,
  persist = true,
  storedDays,
}: UsePersistedPlannerDaysParams) {
  const { days, setDays } = planner;
  const debounced = useDebounce(JSON.stringify(days), 500);
  const stateRef = useRef<{
    ready: boolean;
    lastSaved: string;
    queue: DayPlan[] | null;
    fallback: DayPlan[];
  }>({
    ready: storedDays !== undefined,
    lastSaved: storedDays !== undefined ? JSON.stringify(days) : '',
    queue: null,
    fallback: days,
  });
  useEffect(() => {
    stateRef.current.fallback = days;
    if (!stateRef.current.ready && storedDays !== undefined) {
      stateRef.current.ready = true;
      stateRef.current.lastSaved = JSON.stringify(days);
    }
  }, [days, storedDays]);

  const { mutateAsync, isPending } = persistDays;
  const flush = useCallback(async () => {
    const queued = stateRef.current.queue;
    if (!queued || isPending) return;

    stateRef.current.queue = null;
    try {
      await mutateAsync(queued);
      stateRef.current.lastSaved = JSON.stringify(queued);
      stateRef.current.fallback = queued;
    } catch {
      setDays(stateRef.current.fallback);
    } finally {
      if (stateRef.current.queue) void flush();
    }
  }, [isPending, mutateAsync, setDays]);

  useEffect(() => {
    if (!persist || !stateRef.current.ready) return;
    if (days.length === 0 || debounced === stateRef.current.lastSaved) return;

    stateRef.current.queue = days;
    void flush();
  }, [days, debounced, flush, persist]);

  useEffect(() => {
    const flushOnLifecycle = (event?: Event) => {
      if (!stateRef.current.queue) return;
      if (event?.type === 'visibilitychange' && document.visibilityState !== 'hidden') return;
      void flush();
    };

    window.addEventListener('beforeunload', flushOnLifecycle);
    document.addEventListener('visibilitychange', flushOnLifecycle);
    return () => {
      window.removeEventListener('beforeunload', flushOnLifecycle);
      document.removeEventListener('visibilitychange', flushOnLifecycle);
    };
  }, [flush]);

  return { days, setDays, flush };
}
