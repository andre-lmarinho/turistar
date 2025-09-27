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
  const queueRef = useRef<PersistQueue | null>(null);
  const mountedRef = useRef(true);
  const lastAppliedRef = useRef<string | null>(null);
  const isTestEnv = process.env.NODE_ENV === 'test';
  const persistenceEnabled = !isTestEnv || process.env.ENABLE_PLANNER_PERSIST_TESTS === 'true';
  const noopFlush = useCallback(async () => {}, []);
  const allowRemotePersist = persistenceEnabled && persist;
  const storageKey = `planner:${planId}:days`;
  const [cachedDays, setCachedDays, cacheReady] = useLocalStorage<DayPlan[] | null>(
    storageKey,
    null
  );
  const localSerialized = useMemo(
    () => (cachedDays ? JSON.stringify(cachedDays) : null),
    [cachedDays]
  );

  if (!metaRef.current) {
    const initialSnapshot = snapshotDays(storedDays ?? days);
    metaRef.current = {
      ready: storedDays !== undefined,
      lastSaved: storedDays ? initialSnapshot.serialized : '',
      fallback: initialSnapshot.state,
    };
    lastAppliedRef.current = initialSnapshot.serialized;
  }

  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    []
  );

  useEffect(() => {
    if (!persistenceEnabled) return;
    if (!cacheReady) return;
    if (cachedDays) return;
    if (storedDays !== undefined) return;

    const snapshot = snapshotDays(days);
    setCachedDays(snapshot.state);
    const meta = metaRef.current!;
    meta.fallback = snapshot.state;
    if (!meta.lastSaved) meta.lastSaved = snapshot.serialized;
    lastAppliedRef.current = snapshot.serialized;
  }, [cacheReady, cachedDays, days, persistenceEnabled, setCachedDays, storedDays]);

  useEffect(() => {
    if (!persistenceEnabled) return;
    if (!cacheReady) return;
    if (storedDays !== undefined) return;
    if (!cachedDays) return;

    const snapshot = snapshotDays(cachedDays);
    const meta = metaRef.current!;
    meta.fallback = snapshot.state;
    if (!meta.lastSaved) meta.lastSaved = snapshot.serialized;
    if (lastAppliedRef.current === snapshot.serialized) return;

    lastAppliedRef.current = snapshot.serialized;
    if (mountedRef.current) {
      setDays(cloneDays(cachedDays));
    }
  }, [cacheReady, cachedDays, persistenceEnabled, setDays, storedDays]);

  useEffect(() => {
    if (!persistenceEnabled) return;
    if (storedDays === undefined) return;

    const remoteDays = storedDays ?? [];
    const snapshot = snapshotDays(remoteDays);
    const meta = metaRef.current!;
    meta.ready = true;
    meta.lastSaved = snapshot.serialized;
    meta.fallback = snapshot.state;

    if (cacheReady && localSerialized !== snapshot.serialized) {
      setCachedDays(snapshot.state);
    }

    if (lastAppliedRef.current !== snapshot.serialized) {
      lastAppliedRef.current = snapshot.serialized;
      if (mountedRef.current) {
        setDays(cloneDays(remoteDays));
      }
    }
  }, [cacheReady, localSerialized, persistenceEnabled, setCachedDays, setDays, storedDays]);

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
        const fallbackSnapshot = snapshotDays(meta.fallback);
        meta.fallback = fallbackSnapshot.state;
        lastAppliedRef.current = fallbackSnapshot.serialized;
        setDays(cloneDays(meta.fallback));
        if (cacheReady && localSerialized !== fallbackSnapshot.serialized) {
          setCachedDays(fallbackSnapshot.state);
        }
      }
    } finally {
      if (queueRef.current) void flush();
    }
  }, [
    allowRemotePersist,
    cacheReady,
    isPending,
    localSerialized,
    mutateAsync,
    setCachedDays,
    setDays,
  ]);

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
    if (!cacheReady) return;
    if (debouncedDays.length === 0) return;

    const snapshot = snapshotDays(debouncedDays);
    if (localSerialized !== snapshot.serialized) {
      setCachedDays(snapshot.state);
    }

    if (!allowRemotePersist) return;
    const meta = metaRef.current!;
    if (!meta.ready) return;
    if (snapshot.serialized === meta.lastSaved) return;

    queueRef.current = { state: snapshot.state, serialized: snapshot.serialized };
    void flush();
  }, [
    allowRemotePersist,
    cacheReady,
    debouncedDays,
    flush,
    localSerialized,
    persistenceEnabled,
    setCachedDays,
  ]);

  return { days, setDays, flush: allowRemotePersist ? flush : noopFlush };
}
