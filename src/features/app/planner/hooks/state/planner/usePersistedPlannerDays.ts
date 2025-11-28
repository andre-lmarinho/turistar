'use client';
import { useEffect, useRef } from 'react';
import type { DayPlan } from '@/features/app/planner/domain/types/PlannerEntities';
import { cloneDays } from '@/features/app/planner/services/activities/cloneDays';
import {
  removeBlankActivities,
  snapshotDays,
} from '@/features/app/planner/services/activities/sanitizePlannerDays';
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

interface PersistMeta {
  ready: boolean;
  lastSaved: string;
  fallback: DayPlan[];
}

/**
 * Persists planner days immediately with rollback safeguards.
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
  const metaRef = useRef<PersistMeta | null>(null);
  const persistChainRef = useRef<Promise<void>>(Promise.resolve());
  const lastRequestedRef = useRef<string>('');
  const needsReplayRef = useRef(false);
  const viewSerializedRef = useRef('');
  const didRollbackRef = useRef(false);

  if (metaRef.current == null) {
    const snapshot = snapshotDays(storedDays ?? days);
    const initialMeta: PersistMeta = {
      ready: storedDays !== undefined,
      lastSaved: storedDays ? snapshot.serialized : '',
      fallback: snapshot.state,
    };
    metaRef.current = initialMeta;
  }

  useEffect(() => {
    if (storedDays == null) return;
    const snapshot = snapshotDays(storedDays);
    const meta = metaRef.current!;
    meta.ready = true;

    if (snapshot.state.length === 0 && days.length > 0) {
      meta.lastSaved = snapshot.serialized;
      lastRequestedRef.current = meta.lastSaved;
      viewSerializedRef.current = snapshot.serialized;
      return;
    }

    const hasChanged = snapshot.serialized !== meta.lastSaved;
    meta.lastSaved = snapshot.serialized;
    meta.fallback = snapshot.state;
    lastRequestedRef.current = meta.lastSaved;
    viewSerializedRef.current = snapshot.serialized;
    if (hasChanged) {
      setDays(snapshot.state);
    }
  }, [days.length, setDays, storedDays]);

  const { mutateAsync } = persistDays;

  useEffect(() => {
    const meta = metaRef.current!;
    if (!persist || !meta.ready) return;
    if (days.length === 0) {
      viewSerializedRef.current = '[]';
      return;
    }

    const cleanedDays = removeBlankActivities(days);
    if (cleanedDays.length === 0) {
      viewSerializedRef.current = '[]';
      return;
    }

    const serialized = JSON.stringify(cleanedDays);
    viewSerializedRef.current = serialized;
    if (serialized === meta.lastSaved) {
      lastRequestedRef.current = meta.lastSaved;
      needsReplayRef.current = false;
      return;
    }

    if (!needsReplayRef.current && serialized === lastRequestedRef.current) {
      return;
    }

    const snapshotState = cloneDays(cleanedDays);
    needsReplayRef.current = false;
    lastRequestedRef.current = serialized;

    persistChainRef.current = persistChainRef.current.finally(async () => {
      const previousSaved = meta.lastSaved;
      try {
        await mutateAsync(snapshotState);
        meta.lastSaved = serialized;
        meta.fallback = snapshotState;
        if (didRollbackRef.current && viewSerializedRef.current === previousSaved) {
          didRollbackRef.current = false;
          viewSerializedRef.current = serialized;
          setDays(cloneDays(snapshotState));
        } else if (didRollbackRef.current) {
          didRollbackRef.current = false;
        }
      } catch {
        didRollbackRef.current = true;
        lastRequestedRef.current = meta.lastSaved;
        needsReplayRef.current = true;
        viewSerializedRef.current = meta.lastSaved;
        setDays(cloneDays(meta.fallback));
      }
    });
  }, [days, mutateAsync, persist, setDays]);

  return { days, setDays };
}
