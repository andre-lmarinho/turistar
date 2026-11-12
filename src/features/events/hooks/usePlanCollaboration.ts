"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import type { DayPlan } from "@/features/activity/types";
import { trpc } from "@/trpc/react";
import {
  acknowledgeEvents,
  buildLocalOperations,
  buildSeedEvents,
  type CollaborationQueue,
  projectPendingDays,
} from "../lib/collaborationEngine";
import { normalizeDays, reduceEvents } from "../lib/eventReducer";
import { subscribeToEvents } from "../services/eventsRealtimeClient";
import type { EventInsert, EventRecord, EventState, PlanOperation } from "../types";

interface UsePlanCollaborationOptions {
  enabled?: boolean;
  actorId?: string | null;
  initialDays?: DayPlan[];
}

class VersionGapError extends Error {
  constructor(
    planId: string,
    readonly throughVersion: number
  ) {
    super(
      `Unable to synchronize planner: planId=${planId}, incomplete history through version=${throughVersion}`
    );
  }
}

function createSession(planId: string, enabled: boolean, initialDays: DayPlan[]) {
  const seed = normalizeDays(initialDays);
  return {
    planId,
    enabled,
    seed,
    confirmed: { days: seed, version: 0 } as EventState,
    pending: [] as EventInsert[],
    received: new Map<number, EventRecord>(),
    loaded: !enabled,
    seedRequired: false,
    seedQueued: false,
    active: true,
    generation: 0,
    loading: null as Promise<boolean> | null,
    sending: null as Promise<void> | null,
    error: null as unknown,
  };
}

type Session = ReturnType<typeof createSession>;

/** Delegates the ordered confirmation path to the pure engine and writes the result back. */
function applyAcknowledgement(session: Session, events: EventRecord[]) {
  const queue: CollaborationQueue = {
    planId: session.planId,
    loaded: session.loaded,
    confirmed: session.confirmed,
    pending: session.pending,
    received: session.received,
  };
  const next = acknowledgeEvents(queue, events);
  session.confirmed = next.confirmed;
  session.pending = next.pending;
  session.received = next.received;
  if (
    session.error instanceof VersionGapError &&
    session.received.size === 0 &&
    session.confirmed.version >= session.error.throughVersion
  ) {
    session.error = null;
  }
}

export function usePlanCollaboration(
  planId: string,
  { enabled = true, actorId, initialDays = [] }: UsePlanCollaborationOptions = {}
) {
  // A different document gets a separate session; old network responses cannot write into it.
  const [session, setSession] = useState(() => createSession(planId, enabled, initialDays));
  if (session.planId !== planId || session.enabled !== enabled) {
    setSession(createSession(planId, enabled, initialDays));
  }
  const [revision, render] = useReducer((value: number) => value + 1, 0);
  const utils = trpc.useUtils();
  const append = trpc.viewer.events.append.useMutation();
  const transport = useRef({ utils, append, actorId });
  transport.current = { utils, append, actorId };

  const publish = useCallback(() => {
    if (session.active) render();
  }, [session]);

  const load = useCallback((): Promise<boolean> => {
    if (!session.active || !session.enabled || !session.planId) return Promise.resolve(false);
    if (session.loading) return session.loading;
    const generation = session.generation;
    const current = () => session.active && session.generation === generation;
    const sinceVersion = session.confirmed.version;
    const request = async () => {
      try {
        const snapshot = await transport.current.utils.viewer.snapshots.get.fetch({ planId });
        // A snapshot alone cannot acknowledge an append whose response was lost.
        const events = await transport.current.utils.viewer.events.list.fetch({
          planId,
          sinceVersion: Math.min(snapshot.version, sinceVersion),
        });
        if (!current()) return false;
        let expectedVersion = snapshot.version;
        for (const event of events) {
          if (event.version <= expectedVersion) continue;
          if (event.version !== expectedVersion + 1) {
            throw new Error(
              `Unable to synchronize planner: planId=${planId}, missing version=${expectedVersion + 1}`
            );
          }
          expectedVersion = event.version;
        }
        const reduced = reduceEvents(snapshot, events);
        if (reduced.version >= session.confirmed.version) {
          session.seedRequired = reduced.version === 0 && reduced.days.length === 0;
          session.confirmed = session.seedRequired ? { version: 0, days: session.seed } : reduced;
        }
        session.loaded = true;
        applyAcknowledgement(session, events);
        if (session.received.size > 0) {
          throw new VersionGapError(planId, Math.max(...session.received.keys()));
        }
        return true;
      } catch (error) {
        if (
          current() &&
          (!(error instanceof VersionGapError) || !session.error || session.error instanceof VersionGapError)
        ) {
          // A transient gap must not replace an append failure that still requires retry.
          session.error = error;
        }
        return false;
      } finally {
        if (current()) {
          session.loading = null;
          publish();
        }
      }
    };
    session.loading = request();
    publish();
    return session.loading;
  }, [planId, publish, session]);

  const flush = useCallback((): Promise<void> => {
    if (session.sending) return session.sending;
    if (!session.active || !session.loaded || session.loading || session.error || !session.pending.length) {
      return Promise.resolve();
    }
    const generation = session.generation;
    const current = () => session.active && session.generation === generation;
    const send = async () => {
      let conflicts = 0;
      try {
        while (current() && session.pending.length) {
          if (session.loading && !(await session.loading)) return;
          if (!current() || !session.pending.length) return;
          if (session.seedRequired && !session.seedQueued) {
            session.pending = [
              ...buildSeedEvents(session.seed, planId, transport.current.actorId),
              ...session.pending,
            ];
            session.seedQueued = true;
          }
          const batch = [...session.pending];
          const baseVersion = session.confirmed.version;
          const response = await transport.current.append.mutateAsync({ planId, baseVersion, events: batch });
          if (!current()) return;
          applyAcknowledgement(session, response.events);
          publish();
          if (response.version > session.confirmed.version || session.received.size > 0) {
            if (!(await load())) return;
          }
          const unconfirmed = batch.some((event) =>
            session.pending.some((pending) => pending.id === event.id)
          );
          if (unconfirmed) {
            // The RPC reports version conflicts with an empty event list. Catch up before retrying.
            if (++conflicts > 3 || response.version <= baseVersion) {
              throw new Error(
                `Unable to confirm planner changes: planId=${planId}, baseVersion=${baseVersion}`
              );
            }
            if (!(await load())) return;
          } else {
            conflicts = 0;
          }
        }
      } catch (error) {
        // ponytail: keep the queue in memory. Durable offline storage is a separate feature.
        if (current() && session.pending.length) session.error = error;
      } finally {
        if (current()) {
          session.sending = null;
          publish();
        }
      }
    };
    session.sending = send();
    publish();
    return session.sending;
  }, [load, planId, publish, session]);

  useEffect(() => {
    session.active = true;
    session.generation += 1;
    if (!enabled || !planId) return;
    const channel = subscribeToEvents(
      planId,
      (event) => {
        if (!session.active) return;
        applyAcknowledgement(session, [event]);
        publish();
        if (session.loaded && session.received.size > 0) void load();
      },
      undefined,
      () => {
        // SUBSCRIBED also runs after reconnect, closing the fetch/subscription gap.
        const inFlight = session.loading;
        if (inFlight) void inFlight.then(() => session.active && load());
        else void load();
      }
    );
    void load();
    return () => {
      session.active = false;
      session.generation += 1;
      session.loading = null;
      session.sending = null;
      void channel.unsubscribe();
    };
  }, [enabled, load, planId, publish, session]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: revision wakes the sender when the mutable queue changes.
  useEffect(() => {
    void flush();
  }, [flush, revision]);

  const dispatch = useCallback(
    (build: (days: DayPlan[]) => PlanOperation[]) => {
      if (!session.active || !enabled || !planId) return false;
      const operations = build(projectPendingDays(session.confirmed, session.pending));
      if (operations.length === 0) return false;
      session.pending.push(...buildLocalOperations(operations, planId, transport.current.actorId));
      // Acceptance means queued locally, not confirmed by the server.
      publish();
      return true;
    },
    [enabled, planId, publish, session]
  );

  const retryPending = useCallback(async () => {
    if (session.sending) return session.sending;
    // Resolve uncertain writes by ID before resending at a newer base version.
    if (!(await load())) return;
    session.error = null;
    publish();
    await flush();
  }, [flush, load, publish, session]);

  const discardPending = useCallback(() => {
    if (session.sending) return;
    session.pending = [];
    session.seedQueued = false;
    session.error = null;
    publish();
    void load();
  }, [load, publish, session]);

  return {
    data: projectPendingDays(session.confirmed, session.pending),
    dispatch,
    retryPending,
    discardPending,
    hasPendingChanges: session.pending.length > 0,
    isPending: session.sending !== null,
    isLoading: enabled && (session.loading !== null || (!session.loaded && !session.error)),
    error: session.error,
    version: session.confirmed.version,
  };
}
