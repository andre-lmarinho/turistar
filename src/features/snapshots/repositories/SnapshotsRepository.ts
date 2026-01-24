import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { formatSupabaseError } from "@/shared/lib/supabaseErrors";
import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";
import type { Database } from "@/shared/types/supabase";

type SnapshotsRepositoryOptions = {
  client?: SupabaseClient;
};

export type SnapshotRow = Database["public"]["Tables"]["plan_snapshots"]["Row"];

function getClient(client?: SupabaseClient): SupabaseClient {
  return client ?? createSupabaseServerClient();
}

export async function fetchSnapshot(
  planId: string,
  { client }: SnapshotsRepositoryOptions = {}
): Promise<SnapshotRow | null> {
  const supabase = getClient(client);
  const { data, error } = (await supabase
    .from("plan_snapshots")
    .select("plan_id, version, state, updated_at")
    .eq("plan_id", planId)
    .maybeSingle()) as unknown as { data: SnapshotRow | null; error: unknown };

  if (error) {
    throw formatSupabaseError({
      operation: "fetchSnapshot",
      identifiers: { planId },
      error,
    });
  }

  return data ?? null;
}
