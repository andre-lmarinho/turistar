import type { DayPlan } from "@/features/activity/types";

export interface Snapshot {
  version: number;
  days: DayPlan[];
  updatedAt: string;
}

/** JSONB payload persisted in plan_snapshots.state and passed to the append RPC. */
export interface PersistedSnapshotState {
  days: DayPlan[];
}
