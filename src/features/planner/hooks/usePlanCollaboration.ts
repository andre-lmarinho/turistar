// src/features/planner/hooks/usePlanCollaboration.ts
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import type { PlanEvent, PlanEventInsert } from '@/features/planner/domain/types/PlanEvent';
import { PlanEventsRepository } from '@/features/planner/services/supabase/planEventsRepository';
import {
  applyPlanEvent,
  reducePlanEvents,
} from '@/features/planner/domain/events/planEventReducer';
import { diffPlanEvents } from '@/features/planner/services/diffPlanEvents';
import { cloneDays } from '@/features/planner/services/cloneDays';

interface UsePlanCollaborationOptions {
  enabled?: boolean;
  actorId?: string | null;
}

interface PersistMutation {
  mutate: (state: DayPlan[]) => void;
  mutateAsync: (state: DayPlan[]) => Promise<void>;
  isPending: boolean;
}

export function usePlanCollaboration(
  planId: string,
  { enabled = true, actorId }: UsePlanCollaborationOptions = {}
): {
  data?: DayPlan[];
  isLoading: boolean;
  error?: unknown;
  persistDays: PersistMutation;
  version: number;
} {
  const repoRef = useRef(new PlanEventsRepository());
  const versionRef = useRef(0);
  const snapshotRef = useRef<DayPlan[]>([]);
  const pendingEventIdsRef = useRef(new Set<string>());
  const [state, setState] = useState<{ days: DayPlan[]; version: number } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown>(null);
  const [isPending, setIsPending] = useState(false);

  const load = useCallback(async () => {
    if (!planId || !enabled) return;
    setIsLoading(true);
    try {
      const snapshot = await repoRef.current.fetchSnapshot(planId);
      const events = await repoRef.current.fetchEvents(planId, snapshot.version);
      const reduced = reducePlanEvents(snapshot, events);
      versionRef.current = reduced.version;
      snapshotRef.current = cloneDays(reduced.days);
      setState(reduced);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, planId]);

  useEffect(() => {
    if (!planId || !enabled) return;
    void load();
  }, [enabled, load, planId]);

  const handleRealtimeEvent = useCallback(
    (event: PlanEvent) => {
      if (!enabled) return;
      if (pendingEventIdsRef.current.has(event.id)) {
        pendingEventIdsRef.current.delete(event.id);
      }
      if (event.version <= versionRef.current) return;
      if (event.version > versionRef.current + 1) {
        void load();
        return;
      }
      const nextDays = applyPlanEvent(snapshotRef.current, event);
      versionRef.current = event.version;
      snapshotRef.current = cloneDays(nextDays);
      setState({ version: event.version, days: nextDays });
    },
    [enabled, load]
  );

  useEffect(() => {
    if (!planId || !enabled) return;
    const channel = repoRef.current.subscribeToPlan(planId, handleRealtimeEvent);
    return () => {
      void channel.unsubscribe();
    };
  }, [enabled, handleRealtimeEvent, planId]);

  const appendEvents = useCallback(
    async (events: PlanEventInsert[], baseVersion: number, previous: DayPlan[]) => {
      const { version, events: storedEvents } = await repoRef.current.appendEvents(
        planId,
        baseVersion,
        events
      );
      let updated = cloneDays(previous);
      for (const ev of storedEvents) {
        pendingEventIdsRef.current.delete(ev.id);
        updated = applyPlanEvent(updated, ev);
      }

      const appliedVersion = storedEvents.at(-1)?.version ?? baseVersion;
      const expectedVersion = baseVersion + storedEvents.length;

      versionRef.current = appliedVersion;
      snapshotRef.current = cloneDays(updated);
      setState({ version: appliedVersion, days: updated });

      if (version > expectedVersion || appliedVersion !== version) {
        await load();
        return;
      }

      versionRef.current = version;
    },
    [load, planId]
  );

  const mutateAsync = useCallback(
    async (nextDays: DayPlan[]) => {
      if (!planId || !enabled) return;
      const prevSnapshot = cloneDays(snapshotRef.current);
      const events = diffPlanEvents(planId, snapshotRef.current, nextDays, actorId);
      if (events.length === 0) return;
      const baseVersion = versionRef.current;
      setIsPending(true);
      let optimistic = cloneDays(snapshotRef.current);
      let tempVersion = baseVersion;
      const now = new Date().toISOString();
      for (const event of events) {
        pendingEventIdsRef.current.add(event.id);
        tempVersion += 1;
        const optimisticEvent = {
          ...event,
          version: tempVersion,
          createdAt: now,
        } as PlanEvent;
        optimistic = applyPlanEvent(optimistic, optimisticEvent);
      }
      versionRef.current = tempVersion;
      snapshotRef.current = cloneDays(optimistic);
      setState({ version: tempVersion, days: optimistic });

      try {
        await appendEvents(events, baseVersion, prevSnapshot);
      } catch (err) {
        for (const event of events) {
          pendingEventIdsRef.current.delete(event.id);
        }
        versionRef.current = baseVersion;
        snapshotRef.current = prevSnapshot;
        setState({ version: baseVersion, days: prevSnapshot });
        setError(err);
        void load();
        throw err;
      } finally {
        setIsPending(false);
      }
    },
    [actorId, appendEvents, enabled, load, planId]
  );

  const persistDays = useMemo<PersistMutation>(
    () => ({
      mutate: (value: DayPlan[]) => {
        void mutateAsync(value);
      },
      mutateAsync,
      isPending,
    }),
    [isPending, mutateAsync]
  );

  return {
    data: state?.days,
    isLoading,
    error,
    persistDays,
    version: state?.version ?? 0,
  };
}
