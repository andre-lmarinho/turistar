import { applyPlanEvent } from '@/features/planner/domain/events/planEventReducer';
import type { PlanEvent, PlanEventInsert } from '@/features/planner/domain/types/PlanEvent';
import type { DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import { cloneDays } from '@/features/planner/services/activities/cloneDays';

import { diffPlanEvents } from './diffPlanEvents';

export interface PlanSnapshotState {
  days: DayPlan[];
  version: number;
}

interface ApplyOptimisticParams {
  base: PlanSnapshotState;
  events: PlanEventInsert[];
  timestamp: string;
}

interface ReconcilePersistedParams {
  base: PlanSnapshotState;
  events: PlanEvent[];
  serverVersion: number;
}

interface HandleRealtimeParams {
  current: PlanSnapshotState;
  event: PlanEvent;
}

interface ReconcilePersistedResult {
  state: PlanSnapshotState;
  shouldReload: boolean;
}

interface HandleRealtimeResult {
  state: PlanSnapshotState;
  shouldReload: boolean;
}

export interface PlanEventsCoordinator {
  diff: (
    planId: string,
    previousDays: DayPlan[],
    nextDays: DayPlan[],
    actorId?: string | null
  ) => PlanEventInsert[];
  applyOptimistic: (params: ApplyOptimisticParams) => PlanSnapshotState;
  reconcilePersisted: (params: ReconcilePersistedParams) => ReconcilePersistedResult;
  handleRealtime: (params: HandleRealtimeParams) => HandleRealtimeResult;
  rollback: (events: PlanEventInsert[]) => void;
}

export function createPlanEventsCoordinator(): PlanEventsCoordinator {
  const pendingIds = new Set<string>();

  return {
    diff(planId, previousDays, nextDays, actorId) {
      return diffPlanEvents(planId, previousDays, nextDays, actorId);
    },
    applyOptimistic({ base, events, timestamp }) {
      let version = base.version;
      let days = cloneDays(base.days);
      for (const event of events) {
        pendingIds.add(event.id);
        version += 1;
        const optimisticEvent = {
          ...event,
          version,
          createdAt: timestamp,
        } as PlanEvent;
        days = applyPlanEvent(days, optimisticEvent);
      }

      return {
        days,
        version,
      };
    },
    reconcilePersisted({ base, events, serverVersion }) {
      let days = cloneDays(base.days);
      let appliedVersion = base.version;
      for (const event of events) {
        pendingIds.delete(event.id);
        days = applyPlanEvent(days, event);
        appliedVersion = event.version;
      }

      const expectedVersion = base.version + events.length;
      const shouldReload = serverVersion > expectedVersion || appliedVersion !== serverVersion;

      return {
        state: {
          days,
          version: shouldReload ? appliedVersion : serverVersion,
        },
        shouldReload,
      };
    },
    handleRealtime({ current, event }) {
      pendingIds.delete(event.id);
      if (event.version <= current.version) {
        return { state: current, shouldReload: false };
      }
      if (event.version > current.version + 1) {
        return { state: current, shouldReload: true };
      }

      const days = applyPlanEvent(current.days, event);
      return {
        state: { days, version: event.version },
        shouldReload: false,
      };
    },
    rollback(events) {
      for (const event of events) {
        pendingIds.delete(event.id);
      }
    },
  };
}
