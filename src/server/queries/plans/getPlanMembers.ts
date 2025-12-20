import 'server-only';

import { createSupabaseServerClient } from '@/shared/lib/supabaseServer';
import type { Database } from '@/shared/types/supabase';

type PlanMemberTier = Database['public']['Enums']['plan_member_tier'];

export type PlanMemberProfile = {
  userId: string;
  tier: PlanMemberTier;
  slug: string | null;
  displayName: string | null;
  avatarUrl: string | null;
};

export type PlanMembersPayload = {
  ownerId: string | null;
  members: PlanMemberProfile[];
};

export async function getPlanMembers(planId: string): Promise<PlanMembersPayload> {
  const supabase = createSupabaseServerClient();

  const { data: planRow, error: planError } = (await supabase
    .from('plans')
    .select('user_id')
    .eq('id', planId)
    .maybeSingle()) as unknown as {
    data: { user_id: string | null } | null;
    error: unknown;
  };

  if (planError) {
    throw planError;
  }

  const { data, error } = (await supabase
    .from('plan_members')
    .select('user_id, tier, profiles(id, slug, display_name, avatar_url)')
    .eq('plan_id', planId)
    .order('created_at')) as unknown as {
    data:
      | {
          user_id: string;
          tier: PlanMemberTier;
          profiles: {
            id: string;
            slug: string | null;
            display_name: string | null;
            avatar_url: string | null;
          } | null;
        }[]
      | null;
    error: unknown;
  };

  if (error) {
    throw error;
  }

  const members = (data ?? []).map((row) => ({
    userId: row.user_id,
    tier: row.tier,
    slug: row.profiles?.slug ?? null,
    displayName: row.profiles?.display_name ?? null,
    avatarUrl: row.profiles?.avatar_url ?? null,
  }));

  return { ownerId: planRow?.user_id ?? null, members };
}
