'use client';
import { useEffect, useRef } from 'react';
import type { DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import { isPlaceholderActivity } from '@/features/planner/domain/utils/activityPlaceholders';
import { cloneDays } from '@/features/planner/services/activities/cloneDays';
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

function removeBlankActivities(days: DayPlan[]): DayPlan[] {
  return days.map((day) => {
    const filtered = day.activities.filter((activity) => {
      if (isPlaceholderActivity(activity)) return false;
      if ((activity as { _optimistic?: boolean })._optimistic) return false;
      return true;
    });
    return filtered.length === day.activities.length ? day : { ...day, activities: filtered };
  });
}

function snapshotDays(days: DayPlan[]) {
  const state = cloneDays(removeBlankActivities(days));
  return { state, serialized: JSON.stringify(state) };
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
      return;
    }

    const hasChanged = snapshot.serialized !== meta.lastSaved;
    meta.lastSaved = snapshot.serialized;
    meta.fallback = snapshot.state;
    lastRequestedRef.current = meta.lastSaved;
    if (hasChanged) {
      setDays(snapshot.state);
    }
  }, [days.length, setDays, storedDays]);

  const { mutateAsync } = persistDays;

  useEffect(() => {
    const meta = metaRef.current!;
    if (!persist || !meta.ready) return;
    if (days.length === 0) return;

    const cleanedDays = removeBlankActivities(days);
    if (cleanedDays.length === 0) return;

    const serialized = JSON.stringify(cleanedDays);
    const shouldSkip =
      !needsReplayRef.current &&
      (serialized === meta.lastSaved || serialized === lastRequestedRef.current);
    if (shouldSkip) return;

    const snapshotState = cloneDays(cleanedDays);
    needsReplayRef.current = false;
    lastRequestedRef.current = serialized;

    persistChainRef.current = persistChainRef.current.finally(async () => {
      try {
        await mutateAsync(snapshotState);
        meta.lastSaved = serialized;
        meta.fallback = snapshotState;
      } catch {
        lastRequestedRef.current = meta.lastSaved;
        needsReplayRef.current = true;
        setDays(cloneDays(meta.fallback));
      }
    });
  }, [days, mutateAsync, persist, setDays]);

  return { days, setDays };
}
