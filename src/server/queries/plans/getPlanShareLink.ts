import 'server-only';

import { createSupabaseServerClient } from '@/shared/lib/supabaseServer';

export type PlanShareLink = {
  token: string;
  createdAt: string;
  createdBy: string;
  revokedAt: string | null;
};

export async function getPlanShareLink(planId: string): Promise<PlanShareLink | null> {
  const supabase = createSupabaseServerClient();

  const { data, error } = (await supabase
    .from('plan_share_links')
    .select('token, created_at, created_by, revoked_at')
    .eq('plan_id', planId)
    .maybeSingle()) as unknown as {
    data:
      | {
          token: string;
          created_at: string;
          created_by: string;
          revoked_at: string | null;
        }
      | null;
    error: unknown;
  };

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    token: data.token,
    createdAt: data.created_at,
    createdBy: data.created_by,
    revokedAt: data.revoked_at,
  };
}
