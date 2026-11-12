import "server-only";

import type { DayPlan } from "@/features/activity/types";
import { reduceEvents } from "@/features/events/lib/eventReducer";
import type { EventInsert, EventRecord } from "@/features/events/types";

import type { PersistedSnapshotState, Snapshot } from "@/features/snapshots/types";

export type SnapshotState = PersistedSnapshotState;

export type AppendPreparation =
  | { kind: "ready"; snapshot: SnapshotState }
  | { kind: "conflict" }
  | { kind: "invalid-history"; reason: string }
  | { kind: "empty" };

type BuildSnapshotStateArgs = {
  snapshot: Snapshot;
  baseVersion: number;
  events: EventInsert[];
  history?: EventRecord[];
};

/** A nonzero snapshot without days must be rebuilt from event history before it can be extended. */
export function needsHistoryRebuild(snapshot: Snapshot): boolean {
  return snapshot.version > 0 && snapshot.days.length === 0;
}

function toEventRecord(event: EventInsert, version: number, createdAt: string): EventRecord {
  return { ...event, version, createdAt };
}

function toSnapshotState(days: DayPlan[]): SnapshotState {
  // Strip undefined fields so the payload is JSONB-safe.
  return JSON.parse(JSON.stringify({ days })) as SnapshotState;
}

function rebuildSnapshot(snapshot: Snapshot, history: EventRecord[]): Snapshot {
  const rebuilt = reduceEvents({ ...snapshot, version: 0, days: [] }, history);
  return { ...snapshot, version: rebuilt.version, days: rebuilt.days };
}

export function buildSnapshotStateForAppend({
  snapshot,
  baseVersion,
  events,
  history,
}: BuildSnapshotStateArgs): AppendPreparation {
  if (events.length === 0) return { kind: "empty" };
  if (snapshot.version !== baseVersion) return { kind: "conflict" };

  let baseSnapshot = snapshot;
  if (needsHistoryRebuild(snapshot)) {
    if (!history || history.length === 0) {
      return { kind: "invalid-history", reason: "rebuildable snapshot has no history" };
    }
    const latestVersion = history.reduce((max, event) => Math.max(max, event.version), 0);
    if (latestVersion !== baseVersion) {
      return {
        kind: "invalid-history",
        reason: `history is incomplete through version=${latestVersion}, expected baseVersion=${baseVersion}`,
      };
    }
    baseSnapshot = rebuildSnapshot(snapshot, history);
  }

  const createdAt = new Date().toISOString();
  const eventRecords = events.map((event, index) => toEventRecord(event, baseVersion + index + 1, createdAt));
  const next = reduceEvents(baseSnapshot, eventRecords);
  return { kind: "ready", snapshot: toSnapshotState(next.days) };
}
