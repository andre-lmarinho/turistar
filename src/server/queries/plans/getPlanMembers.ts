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

export type PlanMembersResponse = {
  ownerId: string | null;
  members: PlanMemberProfile[];
};

type PlanRow = {
  id: string;
  user_id: string | null;
};

type ProfileRow = {
  id: string;
  slug: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

export async function getPlanMembers(planIdOrSlug: string): Promise<PlanMembersResponse> {
  const supabase = createSupabaseServerClient();
  const trimmed = planIdOrSlug.trim();

  if (!trimmed) {
    return { ownerId: null, members: [] };
  }

  const looksLikeUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      trimmed
    );
  const planQuery = supabase.from('plans').select('id, user_id');
  const { data: planRow, error: planError } = (await (looksLikeUuid
    ? planQuery.eq('id', trimmed)
    : planQuery.eq('public_slug', trimmed)
  ).maybeSingle()) as { data: PlanRow | null; error: unknown };

  if (planError) {
    throw planError;
  }

  if (!planRow) {
    throw new Error('Plan not found or access denied');
  }

  const ownerId = planRow.user_id ?? null;
  const planId = planRow.id;

  const [membersResult, ownerProfileResult] = await Promise.all([
    supabase
      .from('plan_members')
      .select('user_id, tier, profiles:profiles!plan_members_user_id_fkey(id, slug, display_name, avatar_url)')
      .eq('plan_id', planId)
      .order('created_at') as Promise<{
      data:
        | {
          user_id: string;
          tier: PlanMemberTier;
          profiles: ProfileRow | null;
        }[]
        | null;
      error: unknown;
    }>,
    ownerId
      ? (supabase
          .from('profiles')
          .select('id, slug, display_name, avatar_url')
          .eq('id', ownerId)
          .maybeSingle() as Promise<{ data: ProfileRow | null; error: unknown }>)
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (membersResult.error) {
    throw membersResult.error;
  }
  if (ownerProfileResult.error) {
    throw ownerProfileResult.error;
  }

  const members = (membersResult.data ?? []).map((row) => ({
    userId: row.user_id,
    tier: row.tier,
    slug: row.profiles?.slug ?? null,
    displayName: row.profiles?.display_name ?? null,
    avatarUrl: row.profiles?.avatar_url ?? null,
  }));

  const resolvedOwnerId =
    ownerId ?? members.find((member) => member.tier === 'admin')?.userId ?? null;

  if (resolvedOwnerId && !members.some((member) => member.userId === resolvedOwnerId)) {
    members.unshift({
      userId: resolvedOwnerId,
      tier: 'admin',
      slug: ownerProfileResult.data?.slug ?? null,
      displayName: ownerProfileResult.data?.display_name ?? null,
      avatarUrl: ownerProfileResult.data?.avatar_url ?? null,
    });
  }

  return { ownerId: resolvedOwnerId, members };
}
