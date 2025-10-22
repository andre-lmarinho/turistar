'use client';

import { useCallback, useMemo, useState } from 'react';

import type { DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import type { PlanEvent, PlanEventInsert } from '@/features/planner/domain/types/PlanEvent';
import { appendPlanEvents } from '@/features/planner/services/supabase/planEventsQueries';
import { cloneDays } from '@/features/planner/services/activities/cloneDays';

import {
  createPlanEventsCoordinator,
  type PlanEventsCoordinator,
  type PlanSnapshotState,
} from '@/features/planner/services/events/planEventsCoordinator';
import {
  usePlanSnapshot,
  type SnapshotStatus,
} from '@/features/planner/hooks/data/usePlanSnapshot';
import { usePlanRealtime } from '@/features/planner/hooks/data/usePlanRealtime';

interface UsePlanCollaborationOptions {
  enabled?: boolean;
  actorId?: string | null;
}

interface PersistMutation {
  mutate: (state: DayPlan[]) => void;
  mutateAsync: (state: DayPlan[]) => Promise<void>;
  isPending: boolean;
}

interface PlanCollaborationStatus {
  state: SnapshotStatus;
  isLoading: boolean;
  isPending: boolean;
  error?: unknown;
  version: number;
}

interface UsePlanCollaborationResult {
  data?: DayPlan[];
  status: PlanCollaborationStatus;
  persistDays: PersistMutation;
}

function toSnapshotState(snapshot?: PlanSnapshotState): PlanSnapshotState {
  if (snapshot) {
    return {
      version: snapshot.version,
      days: cloneDays(snapshot.days),
    };
  }
  return { version: 0, days: [] };
}

function getCoordinator(): PlanEventsCoordinator {
  return createPlanEventsCoordinator();
}

export function usePlanCollaboration(
  planId: string,
  { enabled = true, actorId }: UsePlanCollaborationOptions = {}
): UsePlanCollaborationResult {
  const {
    data: snapshot,
    status: snapshotStatus,
    error: snapshotError,
    setSnapshot,
    reload,
  } = usePlanSnapshot(planId, { enabled });
  const coordinator = useMemo(() => getCoordinator(), []);
  const [persistError, setPersistError] = useState<unknown>();
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = useCallback(
    async (nextDays: DayPlan[]) => {
      if (!enabled || !planId) return;
      const baseSnapshot = toSnapshotState(snapshot);
      const events: PlanEventInsert[] = coordinator.diff(
        planId,
        baseSnapshot.days,
        nextDays,
        actorId
      );
      if (events.length === 0) return;

      setPersistError(undefined);
      setIsPending(true);

      const previousState: PlanSnapshotState = {
        version: baseSnapshot.version,
        days: cloneDays(baseSnapshot.days),
      };

      const optimisticState = coordinator.applyOptimistic({
        base: previousState,
        events,
        timestamp: new Date().toISOString(),
      });

      setSnapshot(optimisticState);

      try {
        const persisted = await appendPlanEvents(planId, previousState.version, events);
        const reconciliation = coordinator.reconcilePersisted({
          base: previousState,
          events: persisted.events,
          serverVersion: persisted.version,
        });

        setSnapshot(reconciliation.state);
        setPersistError(undefined);

        if (reconciliation.shouldReload) {
          void reload().catch((error) => {
            setPersistError(error);
          });
        }
      } catch (error) {
        coordinator.rollback(events);
        setSnapshot(previousState);
        setPersistError(error);
        void reload().catch(() => {
          // Keep the persistence error if reload also fails.
        });
        throw error;
      } finally {
        setIsPending(false);
      }
    },
    [actorId, coordinator, enabled, planId, reload, setSnapshot, snapshot]
  );

  const handleRealtimeEvent = useCallback(
    (event: PlanEvent) => {
      let shouldReload = false;
      setSnapshot((current) => {
        if (!current) return current;
        const result = coordinator.handleRealtime({ current, event });
        shouldReload = result.shouldReload;
        return result.state;
      });
      if (shouldReload) {
        void reload().catch((error) => {
          setPersistError(error);
        });
      }
    },
    [coordinator, reload, setSnapshot]
  );

  usePlanRealtime(planId, handleRealtimeEvent, { enabled });

  const mutate = useCallback(
    (value: DayPlan[]) => {
      void mutateAsync(value);
    },
    [mutateAsync]
  );

  const persistDays = useMemo<PersistMutation>(
    () => ({
      mutate,
      mutateAsync,
      isPending,
    }),
    [isPending, mutate, mutateAsync]
  );

  const error = persistError ?? snapshotError;
  const derivedState: SnapshotStatus =
    snapshotStatus === 'error' || error ? 'error' : snapshotStatus;

  const status = useMemo<PlanCollaborationStatus>(
    () => ({
      state: derivedState,
      isLoading: snapshotStatus === 'loading',
      isPending,
      error,
      version: snapshot?.version ?? 0,
    }),
    [derivedState, error, isPending, snapshot?.version, snapshotStatus]
  );

  return {
    data: snapshot?.days,
    status,
    persistDays,
  };
}
