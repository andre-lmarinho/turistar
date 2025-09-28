// src/features/planner/hooks/usePersistedPlannerDays.ts
'use client';
import { useCallback, useEffect, useRef } from 'react';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import { isPlaceholderActivity } from '@/features/planner/domain/utils/activityPlaceholders';
import type { usePlanner } from './usePlanner';

interface PersistDaysMutation {
  mutateAsync: (state: DayPlan[]) => Promise<unknown>;
  isPending: boolean;
}

interface UsePersistedPlannerDaysParams {
  planner: Pick<ReturnType<typeof usePlanner>, 'days' | 'setDays'>;
  persistDays: PersistDaysMutation;
  persist?: boolean;
  storedDays?: DayPlan[] | null;
}

interface PersistQueue {
  state: DayPlan[];
  serialized: string;
}

interface PersistMeta {
  ready: boolean;
  lastSaved: string;
  fallback: DayPlan[];
}

function removeBlankActivities(days: DayPlan[]): DayPlan[] {
  return days.map((day) => {
    const filtered = day.activities.filter((activity) => !isPlaceholderActivity(activity));
    return filtered.length === day.activities.length ? day : { ...day, activities: filtered };
  });
}

function cloneDays(days: DayPlan[]): DayPlan[] {
  return days.map((day) => ({
    ...day,
    activities: day.activities.map((activity) => ({ ...activity })),
  }));
}

function snapshotDays(days: DayPlan[]) {
  const state = cloneDays(removeBlankActivities(days));
  return { state, serialized: JSON.stringify(state) };
}

/**
 * Persists planner days with debounce, rollback, and lifecycle-aware flushing.
 *
 * The hook keeps a cloned snapshot of the last saved state so failed mutations can
 * safely roll back even though the planner mutates nested arrays in place.
 */
export function usePersistedPlannerDays({
  planner,
  persistDays,
  persist = true,
  storedDays,
}: UsePersistedPlannerDaysParams) {
  const { days, setDays } = planner;
  const debouncedDays = useDebounce(days, 500);
  const metaRef = useRef<PersistMeta | null>(null);
  if (!metaRef.current) {
    const snapshot = snapshotDays(storedDays ?? days);
    metaRef.current = {
      ready: storedDays !== undefined,
      lastSaved: storedDays ? snapshot.serialized : '',
      fallback: snapshot.state,
    };
  }
  const queueRef = useRef<PersistQueue | null>(null);

  useEffect(() => {
    if (storedDays == null) return;
    const snapshot = snapshotDays(storedDays);
    const meta = metaRef.current!;
    meta.ready = true;

    if (snapshot.state.length === 0 && days.length > 0) {
      meta.lastSaved = snapshot.serialized;
      return;
    }

    const hasChanged = snapshot.serialized !== meta.lastSaved;
    meta.lastSaved = snapshot.serialized;
    meta.fallback = snapshot.state;
    if (hasChanged) {
      setDays(snapshot.state);
    }
  }, [days.length, setDays, storedDays]);

  const { mutateAsync, isPending } = persistDays;
  const flush = useCallback(async () => {
    const queued = queueRef.current;
    const meta = metaRef.current!;
    if (!queued || isPending) return;

    queueRef.current = null;
    try {
      await mutateAsync(queued.state);
      meta.lastSaved = queued.serialized;
      meta.fallback = queued.state;
    } catch {
      setDays(cloneDays(meta.fallback));
    } finally {
      if (queueRef.current) void flush();
    }
  }, [isPending, mutateAsync, setDays]);

  useEffect(() => {
    const meta = metaRef.current!;
    if (!persist || !meta.ready) return;
    if (debouncedDays.length === 0) return;

    const cleanedDays = removeBlankActivities(debouncedDays);
    const serialized = JSON.stringify(cleanedDays);
    if (serialized === meta.lastSaved) return;

    queueRef.current = { state: cloneDays(cleanedDays), serialized };
    void flush();
  }, [debouncedDays, flush, persist]);

  useEffect(() => {
    if (!persist) return;

    const flushOnLifecycle = (event?: Event) => {
      if (!queueRef.current) return;
      if (event?.type === 'visibilitychange' && document.visibilityState !== 'hidden') return;
      void flush();
    };

    window.addEventListener('beforeunload', flushOnLifecycle);
    document.addEventListener('visibilitychange', flushOnLifecycle);
    return () => {
      window.removeEventListener('beforeunload', flushOnLifecycle);
      document.removeEventListener('visibilitychange', flushOnLifecycle);
    };
  }, [flush, persist]);

  return { days, setDays, flush };
}
