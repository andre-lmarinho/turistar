import type { DayPlan } from "@/features/activity/types";

export interface Snapshot {
  version: number;
  days: DayPlan[];
  updatedAt: string;
}
