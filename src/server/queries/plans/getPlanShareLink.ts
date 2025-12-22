import 'server-only';

import { createSupabaseServerClient } from '@/shared/lib/supabaseServer';

export type PlanShareLink = {
  token: string;
  createdAt: string;
  createdBy: string;
  revokedAt: string | null;
};

export async function getPlanShareLink(planIdOrSlug: string): Promise<PlanShareLink | null> {
  const supabase = createSupabaseServerClient();
  const trimmed = planIdOrSlug.trim();
  if (!trimmed) {
    return null;
  }

  const looksLikeUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      trimmed
    );

  let planId = trimmed;
  if (!looksLikeUuid) {
    const { data: planRow, error: planError } = (await supabase
      .from('plans')
      .select('id')
      .eq('public_slug', trimmed)
      .maybeSingle()) as { data: { id: string } | null; error: unknown };
    if (planError) {
      throw planError;
    }
    if (!planRow) {
      return null;
    }
    planId = planRow.id;
  }

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
