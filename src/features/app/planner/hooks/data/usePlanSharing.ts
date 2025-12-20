import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { addPlanMemberByEmail } from '@/app/(webapp)/p/actions/plans/addPlanMemberByEmail';
import { createPlanShareLink } from '@/app/(webapp)/p/actions/plans/createPlanShareLink';
import { leavePlan } from '@/app/(webapp)/p/actions/plans/leavePlan';
import { removePlanMember } from '@/app/(webapp)/p/actions/plans/removePlanMember';
import { revokePlanShareLink } from '@/app/(webapp)/p/actions/plans/revokePlanShareLink';
import { updatePlanMemberTier } from '@/app/(webapp)/p/actions/plans/updatePlanMemberTier';
import { supabase } from '@/shared/lib/supabaseClient';
import type { Database } from '@/shared/types/supabase';

type PlanMemberTier = Database['public']['Enums']['plan_member_tier'];

type PlanMemberProfile = {
  userId: string;
  tier: PlanMemberTier;
  slug: string | null;
  displayName: string | null;
  avatarUrl: string | null;
};

type PlanMembersResponse = {
  ownerId: string | null;
  members: PlanMemberProfile[];
};

type PlanShareLink = {
  token: string;
  createdAt: string;
  createdBy: string;
  revokedAt: string | null;
};

type PlanSharingOptions = {
  enabled?: boolean;
};

const missingPlanIdError = () => new Error('Missing plan id');

export function usePlanMembers(planId: string, options: PlanSharingOptions = {}) {
  const enabled = options.enabled ?? true;
  const qc = useQueryClient();
  const queryKey = ['plan_members', planId] as const;

  const query = useQuery<PlanMembersResponse>({
    queryKey,
    enabled: Boolean(planId) && enabled,
    queryFn: async () => {
      const [planResult, membersResult] = await Promise.all([
        supabase.from('plans').select('user_id').eq('id', planId).maybeSingle() as Promise<{
          data: { user_id: string | null } | null;
          error: unknown;
        }>,
        supabase
          .from('plan_members')
          .select('user_id, tier, profiles(id, slug, display_name, avatar_url)')
          .eq('plan_id', planId)
          .order('created_at') as Promise<{
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
        }>,
      ]);

      if (planResult.error) {
        throw planResult.error;
      }
      if (membersResult.error) {
        throw membersResult.error;
      }

      const members = (membersResult.data ?? []).map((row) => ({
        userId: row.user_id,
        tier: row.tier,
        slug: row.profiles?.slug ?? null,
        displayName: row.profiles?.display_name ?? null,
        avatarUrl: row.profiles?.avatar_url ?? null,
      }));

      return {
        ownerId: planResult.data?.user_id ?? null,
        members,
      };
    },
  });

  const addMember = useMutation({
    mutationFn: async ({ email, tier }: { email: string; tier: PlanMemberTier }) => {
      if (!planId) {
        throw missingPlanIdError();
      }
      return addPlanMemberByEmail(planId, email, tier);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  const updateTier = useMutation({
    mutationFn: async ({ userId, tier }: { userId: string; tier: PlanMemberTier }) => {
      if (!planId) {
        throw missingPlanIdError();
      }
      await updatePlanMemberTier(planId, userId, tier);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  const removeMember = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      if (!planId) {
        throw missingPlanIdError();
      }
      await removePlanMember(planId, userId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  const leave = useMutation({
    mutationFn: async () => {
      if (!planId) {
        throw missingPlanIdError();
      }
      await leavePlan(planId);
    },
    onSuccess: () => {
      qc.removeQueries({ queryKey });
    },
  });

  return {
    ...query,
    addMember,
    updateTier,
    removeMember,
    leave,
  };
}

export function usePlanShareLink(planId: string, options: PlanSharingOptions = {}) {
  const enabled = options.enabled ?? true;
  const qc = useQueryClient();
  const queryKey = ['plan_share_link', planId] as const;

  const query = useQuery<PlanShareLink | null>({
    queryKey,
    enabled: Boolean(planId) && enabled,
    queryFn: async () => {
      const { data, error } = (await supabase
        .from('plan_share_links')
        .select('token, created_at, created_by, revoked_at')
        .eq('plan_id', planId)
        .maybeSingle()) as {
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

      if (!data || data.revoked_at) {
        return null;
      }

      return {
        token: data.token,
        createdAt: data.created_at,
        createdBy: data.created_by,
        revokedAt: data.revoked_at,
      };
    },
  });

  const createLink = useMutation({
    mutationFn: async () => {
      if (!planId) {
        throw missingPlanIdError();
      }
      return createPlanShareLink(planId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  const revokeLink = useMutation({
    mutationFn: async () => {
      if (!planId) {
        throw missingPlanIdError();
      }
      return revokePlanShareLink(planId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  return {
    ...query,
    createLink,
    revokeLink,
  };
}

export type { PlanMemberTier, PlanMemberProfile, PlanMembersResponse, PlanShareLink };
