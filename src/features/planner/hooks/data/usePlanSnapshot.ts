'use client';

import { useCallback, useEffect, useState } from 'react';

import type { PlanSnapshotState } from '@/features/planner/services/events/planEventsCoordinator';
import {
  fetchPlanEvents,
  fetchPlanSnapshot,
} from '@/features/planner/services/supabase/planEventsQueries';
import { reducePlanEvents } from '@/features/planner/domain/events/planEventReducer';
import { cloneDays } from '@/features/planner/services/activities/cloneDays';

export type SnapshotStatus = 'idle' | 'loading' | 'ready' | 'error';

interface UsePlanSnapshotOptions {
  enabled?: boolean;
}

export interface UsePlanSnapshotResult {
  data?: PlanSnapshotState;
  status: SnapshotStatus;
  error?: unknown;
  setSnapshot: (
    value:
      | PlanSnapshotState
      | undefined
      | ((previous?: PlanSnapshotState) => PlanSnapshotState | undefined)
  ) => void;
  setError: (error?: unknown) => void;
  reload: () => Promise<PlanSnapshotState | undefined>;
}

function normalizeSnapshot(value?: PlanSnapshotState): PlanSnapshotState | undefined {
  if (!value) return undefined;
  return {
    version: value.version,
    days: cloneDays(value.days),
  };
}

export function usePlanSnapshot(
  planId: string,
  { enabled = true }: UsePlanSnapshotOptions = {}
): UsePlanSnapshotResult {
  const [data, setData] = useState<PlanSnapshotState | undefined>();
  const [status, setStatus] = useState<SnapshotStatus>(enabled ? 'loading' : 'idle');
  const [error, setError] = useState<unknown>();

  const load = useCallback(async (): Promise<PlanSnapshotState | undefined> => {
    if (!enabled || !planId) return undefined;
    setStatus('loading');
    setError(undefined);
    try {
      const snapshot = await fetchPlanSnapshot(planId);
      const events = await fetchPlanEvents(planId, snapshot.version);
      const reduced = reducePlanEvents(snapshot, events);
      const next = normalizeSnapshot({
        days: reduced.days,
        version: reduced.version,
      });
      setData(next);
      setStatus('ready');
      return next;
    } catch (err) {
      setError(err);
      setStatus('error');
      throw err;
    }
  }, [enabled, planId]);

  useEffect(() => {
    if (!enabled || !planId) {
      setData(undefined);
      setStatus('idle');
      setError(undefined);
      return;
    }
    void load();
  }, [enabled, load, planId]);

  const setSnapshot = useCallback<UsePlanSnapshotResult['setSnapshot']>((value) => {
    setData((previous) => {
      const resolved = typeof value === 'function' ? value(previous) : value;
      return normalizeSnapshot(resolved);
    });
    setStatus((current) => (current === 'idle' || current === 'loading' ? 'ready' : current));
    setError(undefined);
  }, []);

  const assignError = useCallback<UsePlanSnapshotResult['setError']>((nextError) => {
    setError(nextError);
    setStatus('error');
  }, []);

  return {
    data,
    status,
    error,
    setSnapshot,
    setError: assignError,
    reload: load,
  };
}
