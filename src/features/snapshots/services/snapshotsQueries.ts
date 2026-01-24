import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { fetchSnapshot as fetchSnapshotRepository } from "../repositories/SnapshotsRepository";
import { mapSnapshot, SnapshotRowSchema } from "../services/snapshotsSchemas";
import type { Snapshot } from "../types";

type PlannerSupabaseClient = SupabaseClient;

export async function fetchSnapshot(planId: string, client?: PlannerSupabaseClient): Promise<Snapshot> {
  const data = await fetchSnapshotRepository(planId, { client });
  const parsed = SnapshotRowSchema.parse(
    data ?? {
      plan_id: planId,
      version: 0,
      state: { days: [] },
      updated_at: new Date(0).toISOString(),
    }
  );
  return mapSnapshot(parsed);
}
