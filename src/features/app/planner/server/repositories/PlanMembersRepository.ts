import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/shared/types/supabase';
import { createSupabaseServerClient } from '@/shared/lib/supabaseServer';
import { formatSupabaseError } from '@/shared/lib/supabaseErrors';

type PlanMemberTier = 'admin' | 'member';

export type PlanIdentityRecord = {
  id: string;
  ownerId: string | null;
};

export type ProfileRecord = {
  userId: string;
  slug: string | null;
  displayName: string | null;
  avatarUrl: string | null;
};

export type PlanMemberProfileRecord = {
  userId: string;
  tier: PlanMemberTier;
  profile: ProfileRecord | null;
};

type PlanMembersRepositoryOptions = {
  client?: SupabaseClient;
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

type PlanMemberRow = {
  user_id: string;
  tier: PlanMemberTier;
  profiles: ProfileRow | null;
};

type RpcResponse<T> = {
  data: T | null;
  error: unknown;
};

function getClient(client?: SupabaseClient): SupabaseClient {
  return client ?? createSupabaseServerClient();
}

function mapProfile(row: ProfileRow | null): ProfileRecord | null {
  if (!row) {
    return null;
  }

  return {
    userId: row.id,
    slug: row.slug,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
  };
}

export async function fetchPlanIdentityById(
  planId: string,
  { client }: PlanMembersRepositoryOptions = {}
): Promise<PlanIdentityRecord | null> {
  const supabase = getClient(client);
  const { data, error } = (await supabase
    .from('plans')
    .select('id, user_id')
    .eq('id', planId)
    .maybeSingle()) as unknown as { data: PlanRow | null; error: unknown };

  if (error) {
    throw formatSupabaseError({
      operation: 'fetchPlanIdentityById',
      identifiers: { planId },
      error,
    });
  }

  if (!data) {
    return null;
  }

  return { id: data.id, ownerId: data.user_id };
}

export async function fetchPlanIdentityBySlug(
  slug: string,
  { client }: PlanMembersRepositoryOptions = {}
): Promise<PlanIdentityRecord | null> {
  const supabase = getClient(client);
  const { data, error } = (await supabase
    .from('plans')
    .select('id, user_id')
    .eq('public_slug', slug)
    .maybeSingle()) as unknown as { data: PlanRow | null; error: unknown };

  if (error) {
    throw formatSupabaseError({
      operation: 'fetchPlanIdentityBySlug',
      identifiers: { slug },
      error,
    });
  }

  if (!data) {
    return null;
  }

  return { id: data.id, ownerId: data.user_id };
}

export async function fetchPlanMembersWithProfiles(
  planId: string,
  { client }: PlanMembersRepositoryOptions = {}
): Promise<PlanMemberProfileRecord[]> {
  const supabase = getClient(client);
  const { data, error } = (await supabase
    .from('plan_members')
    .select(
      'user_id, tier, profiles:profiles!plan_members_user_id_fkey(id, slug, display_name, avatar_url)'
    )
    .eq('plan_id', planId)
    .order('created_at')) as unknown as { data: PlanMemberRow[] | null; error: unknown };

  if (error) {
    throw formatSupabaseError({
      operation: 'fetchPlanMembersWithProfiles',
      identifiers: { planId },
      error,
    });
  }

  if (!data) {
    return [];
  }

  return data.map((row) => ({
    userId: row.user_id,
    tier: row.tier,
    profile: mapProfile(row.profiles),
  }));
}

export async function fetchProfileById(
  userId: string,
  { client }: PlanMembersRepositoryOptions = {}
): Promise<ProfileRecord | null> {
  const supabase = getClient(client);
  const { data, error } = (await supabase
    .from('profiles')
    .select('id, slug, display_name, avatar_url')
    .eq('id', userId)
    .maybeSingle()) as unknown as { data: ProfileRow | null; error: unknown };

  if (error) {
    throw formatSupabaseError({
      operation: 'fetchProfileById',
      identifiers: { userId },
      error,
    });
  }

  return mapProfile(data);
}

export async function addPlanMemberByEmail(
  planId: string,
  email: string,
  tier: PlanMemberTier,
  { client }: PlanMembersRepositoryOptions = {}
): Promise<RpcResponse<Database['public']['Functions']['add_plan_member_by_email']['Returns']>> {
  const supabase = getClient(client);
  const { data, error } = (await supabase.rpc('add_plan_member_by_email', {
    _plan_id: planId,
    _email: email,
    _tier: tier,
  })) as unknown as RpcResponse<
    Database['public']['Functions']['add_plan_member_by_email']['Returns']
  >;

  return { data, error };
}

export async function updatePlanMemberTier(
  planId: string,
  userId: string,
  tier: PlanMemberTier,
  { client }: PlanMembersRepositoryOptions = {}
): Promise<RpcResponse<Database['public']['Functions']['update_plan_member_tier']['Returns']>> {
  const supabase = getClient(client);
  const { data, error } = (await supabase.rpc('update_plan_member_tier', {
    _plan_id: planId,
    _user_id: userId,
    _tier: tier,
  })) as unknown as RpcResponse<
    Database['public']['Functions']['update_plan_member_tier']['Returns']
  >;

  return { data, error };
}

export async function removePlanMember(
  planId: string,
  userId: string,
  { client }: PlanMembersRepositoryOptions = {}
): Promise<RpcResponse<Database['public']['Functions']['remove_plan_member']['Returns']>> {
  const supabase = getClient(client);
  const { data, error } = (await supabase.rpc('remove_plan_member', {
    _plan_id: planId,
    _user_id: userId,
  })) as unknown as RpcResponse<
    Database['public']['Functions']['remove_plan_member']['Returns']
  >;

  return { data, error };
}

export async function leavePlan(
  planId: string,
  { client }: PlanMembersRepositoryOptions = {}
): Promise<RpcResponse<Database['public']['Functions']['leave_plan']['Returns']>> {
  const supabase = getClient(client);
  const { data, error } = (await supabase.rpc('leave_plan', {
    _plan_id: planId,
  })) as unknown as RpcResponse<Database['public']['Functions']['leave_plan']['Returns']>;

  return { data, error };
}
