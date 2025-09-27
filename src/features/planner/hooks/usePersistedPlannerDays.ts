// src/features/planner/hooks/usePersistedPlannerDays.ts
'use client';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import type { usePlanner } from './usePlanner';
import { useLocalStorage } from '@/shared/hooks/useLocalStorage';

interface PersistDaysMutation {
  mutateAsync: (state: DayPlan[]) => Promise<unknown>;
  isPending: boolean;
}

interface UsePersistedPlannerDaysParams {
  planner: Pick<ReturnType<typeof usePlanner>, 'days' | 'setDays'>;
  planId: string;
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

function cloneDays(days: DayPlan[]): DayPlan[] {
  return days.map((day) => ({
    ...day,
    activities: day.activities.map((activity) => ({ ...activity })),
  }));
}

function snapshotDays(days: DayPlan[]) {
  const state = cloneDays(days);
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
  planId,
  persistDays,
  persist = true,
  storedDays,
}: UsePersistedPlannerDaysParams) {
  const { days, setDays } = planner;
  const debouncedDays = useDebounce(days, 500);
  const metaRef = useRef<PersistMeta | null>(null);
  const mountedRef = useRef(true);
  const isTestEnv = process.env.NODE_ENV === 'test';
  const persistenceEnabled = !isTestEnv || process.env.ENABLE_PLANNER_PERSIST_TESTS === 'true';
  const noopFlush = useCallback(async () => {}, []);
  const allowRemotePersist = persistenceEnabled && persist;
  const storageKey = `planner:${planId}:days`;
  const [localSnapshot, setLocalSnapshot, localReady] = useLocalStorage<DayPlan[] | null>(
    storageKey,
    null
  );
  const localSerialized = useMemo(
    () => (localSnapshot ? JSON.stringify(localSnapshot) : null),
    [localSnapshot]
  );
  if (!metaRef.current) {
    const snapshot = snapshotDays(storedDays ?? days);
    metaRef.current = {
      ready: storedDays !== undefined,
      lastSaved: storedDays ? snapshot.serialized : '',
      fallback: snapshot.state,
    };
  }
  const queueRef = useRef<PersistQueue | null>(null);

  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    []
  );

  useEffect(() => {
    if (!persistenceEnabled) return;
    if (storedDays == null) return;
    const snapshot = snapshotDays(storedDays);
    const meta = metaRef.current!;
    meta.ready = true;
    meta.lastSaved = snapshot.serialized;
    meta.fallback = snapshot.state;
    if (localSerialized !== snapshot.serialized) {
      setLocalSnapshot(snapshot.state);
    }
  }, [localSerialized, persistenceEnabled, setLocalSnapshot, storedDays]);

  useEffect(() => {
    if (!persistenceEnabled) return;
    if (!localReady) return;
    if (storedDays !== undefined) return;
    if (!localSnapshot) return;
    const meta = metaRef.current!;
    meta.ready = true;
    const snapshot = snapshotDays(localSnapshot);
    meta.lastSaved = snapshot.serialized;
    meta.fallback = snapshot.state;
    if (mountedRef.current) {
      setDays(cloneDays(localSnapshot));
    }
  }, [localReady, localSnapshot, persistenceEnabled, setDays, storedDays]);

  useEffect(() => {
    if (!persistenceEnabled) return;
    if (!localReady) return;
    if (storedDays !== undefined) return;
    if (localSnapshot) return;

    const meta = metaRef.current!;
    if (meta.ready) return;

    const snapshot = snapshotDays(days);
    meta.ready = true;
    meta.lastSaved = snapshot.serialized;
    meta.fallback = snapshot.state;
    setLocalSnapshot(snapshot.state);
  }, [days, localReady, localSnapshot, persistenceEnabled, setLocalSnapshot, storedDays]);

  const { mutateAsync, isPending } = persistDays;
  const flush = useCallback(async () => {
    if (!allowRemotePersist) return;
    const queued = queueRef.current;
    const meta = metaRef.current!;
    if (!queued || isPending) return;

    queueRef.current = null;
    try {
      await mutateAsync(queued.state);
      meta.lastSaved = queued.serialized;
      meta.fallback = queued.state;
    } catch {
      if (mountedRef.current) {
        setDays(cloneDays(meta.fallback));
      }
    } finally {
      if (queueRef.current) void flush();
    }
  }, [allowRemotePersist, isPending, mutateAsync, setDays]);

  useEffect(() => {
    if (!allowRemotePersist) return;
    const meta = metaRef.current!;
    if (!meta.ready) return;
    if (debouncedDays.length === 0) return;

    const serialized = JSON.stringify(debouncedDays);
    if (serialized === meta.lastSaved) return;

    queueRef.current = { state: cloneDays(debouncedDays), serialized };
    void flush();
  }, [allowRemotePersist, debouncedDays, flush]);

  useEffect(() => {
    if (!allowRemotePersist) return;

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
  }, [allowRemotePersist, flush]);

  useEffect(() => {
    if (!persistenceEnabled) return;
    if (!localReady) return;
    const meta = metaRef.current;
    if (!meta?.ready) return;

    const serialized = JSON.stringify(days);
    if (serialized === localSerialized) return;

    setLocalSnapshot(cloneDays(days));
  }, [days, localReady, localSerialized, persistenceEnabled, setLocalSnapshot]);

  return { days, setDays, flush: allowRemotePersist ? flush : noopFlush };
}
