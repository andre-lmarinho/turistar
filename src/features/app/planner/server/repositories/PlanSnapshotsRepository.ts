import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import { formatSupabaseError } from '@/features/app/planner/services/supabase/supabaseErrors';
import { createSupabaseServerClient } from '@/shared/lib/supabaseServer';
import type { Database } from '@/shared/types/supabase';

type PlanSnapshotsRepositoryOptions = {
  client?: SupabaseClient;
};

export type PlanSnapshotRow = Database['public']['Tables']['plan_snapshots']['Row'];

function getClient(client?: SupabaseClient): SupabaseClient {
  return client ?? createSupabaseServerClient();
}

export async function fetchPlanSnapshot(
  planId: string,
  { client }: PlanSnapshotsRepositoryOptions = {}
): Promise<PlanSnapshotRow | null> {
  const supabase = getClient(client);
  const { data, error } = (await supabase
    .from('plan_snapshots')
    .select('plan_id, version, state, updated_at')
    .eq('plan_id', planId)
    .maybeSingle()) as unknown as { data: PlanSnapshotRow | null; error: unknown };

  if (error) {
    throw formatSupabaseError({
      operation: 'fetchPlanSnapshot',
      identifiers: { planId },
      error,
    });
  }

  return data ?? null;
}
