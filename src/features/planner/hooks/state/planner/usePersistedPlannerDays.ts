'use client';
import { useEffect, useRef } from 'react';
import type { DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import { cloneDays } from '@/features/planner/services/activities/cloneDays';
import {
  removeBlankActivities,
  snapshotDays,
} from '@/features/planner/services/activities/sanitizePlannerDays';
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

  useEffect(() => {
    const meta = metaRef.current!;
    if (!persist || !meta.ready) return;
    if (days.length === 0) return;

    const cleanedDays = removeBlankActivities(days);
    if (cleanedDays.length === 0) return;

    const serialized = JSON.stringify(cleanedDays);
    if (serialized === meta.lastSaved) return;
    if (isPending) return;

    const snapshotState = cloneDays(cleanedDays);

    void (async () => {
      try {
        await mutateAsync(snapshotState);
        meta.lastSaved = serialized;
        meta.fallback = snapshotState;
      } catch {
        setDays(cloneDays(meta.fallback));
      }
    })();
  }, [days, isPending, mutateAsync, persist, setDays]);

  return { days, setDays };
}
