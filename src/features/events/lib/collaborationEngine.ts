import { POSITION_SCALE } from "@/features/activity/lib/gapOrdering";
import type { DayPlan } from "@/features/activity/types";
import type { EventInsert, EventRecord, EventState, PlanOperation } from "../types";
import { applyEvent } from "./eventReducer";

/**
 * Transport-independent collaboration decisions.
 *
 * The React hook owns lifecycle (in-flight promises, generations); this module owns the
 * ordered confirmation path so it can be tested without rendering.
 */
export type CollaborationQueue = {
  planId: string;
  loaded: boolean;
  confirmed: EventState;
  pending: EventInsert[];
  received: Map<number, EventRecord>;
};

/**
 * Buffers delivered events and confirms them in version order.
 *
 * HTTP responses and realtime deliveries share one ordered confirmation path: an event
 * confirms only when it is exactly `confirmed.version + 1`; anything ahead is held until
 * the gap fills. Confirmed events remove matching pending edits by ID, so the same event
 * delivered twice (realtime + HTTP) acknowledges once.
 */
export function acknowledgeEvents(queue: CollaborationQueue, events: EventRecord[]): CollaborationQueue {
  const received = new Map(queue.received);
  for (const event of events) {
    if (event.planId === queue.planId) received.set(event.version, event);
  }
  if (!queue.loaded) return { ...queue, received };

  let confirmed = queue.confirmed;
  let pending = queue.pending;
  for (const event of [...received.values()].sort((a, b) => a.version - b.version)) {
    if (event.version > confirmed.version + 1) break;
    if (event.version > confirmed.version) {
      confirmed = { days: applyEvent(confirmed.days, event), version: event.version };
    }
    pending = pending.filter((pendingEvent) => pendingEvent.id !== event.id);
    received.delete(event.version);
  }
  return { ...queue, received, confirmed, pending };
}

/** Confirmed days with pending local edits applied, for rendering. */
export function projectPendingDays(confirmed: EventState, pending: EventInsert[]): DayPlan[] {
  return pending.reduce(applyEvent, confirmed.days);
}

/** Day-created inserts are the only operation seed persistence emits. */
export function buildSeedEvents(
  seed: DayPlan[],
  planId: string,
  actorId: string | null | undefined
): Extract<EventInsert, { type: "day.created" }>[] {
  return seed.map((day, index) => ({
    id: crypto.randomUUID(),
    planId,
    actorId,
    type: "day.created",
    payload: { day: { ...day, position: day.position ?? String((index + 1) * POSITION_SCALE) } },
  }));
}

/** Wraps local intent operations as inserts for the append transport. */
export function buildLocalOperations(
  operations: PlanOperation[],
  planId: string,
  actorId: string | null | undefined
): EventInsert[] {
  return operations.map(
    (operation): EventInsert => ({
      ...operation,
      id: crypto.randomUUID(),
      planId,
      actorId,
    })
  );
}
