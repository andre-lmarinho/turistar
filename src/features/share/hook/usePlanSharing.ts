import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { addPlanMemberByEmail } from "@/features/share/lib/addPlanMemberByEmail";
import { createPlanShareLink } from "@/features/share/lib/createPlanShareLink";
import { getPlanMembers } from "@/features/share/lib/getPlanMembers";
import { getPlanShareLink } from "@/features/share/lib/getPlanShareLink";
import { leavePlan } from "@/features/share/lib/leavePlan";
import { removePlanMember } from "@/features/share/lib/removePlanMember";
import { revokePlanShareLink } from "@/features/share/lib/revokePlanShareLink";
import { updatePlanMemberTier } from "@/features/share/lib/updatePlanMemberTier";

type PlanMemberTier = "admin" | "member";

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

const missingPlanIdError = () => new Error("Missing plan id");

export function usePlanMembers(planId: string, options: PlanSharingOptions = {}) {
  const enabled = options.enabled ?? true;
  const qc = useQueryClient();
  const queryKey = ["plan_members", planId] as const;

  const query = useQuery<PlanMembersResponse>({
    queryKey,
    enabled: Boolean(planId) && enabled,
    queryFn: async () => {
      if (!planId) {
        throw missingPlanIdError();
      }
      return getPlanMembers(planId);
    },
  });

  const addMember = useMutation({
    mutationFn: async ({ email, tier }: { email: string; tier: PlanMemberTier }) => {
      if (!planId) {
        throw missingPlanIdError();
      }
      return addPlanMemberByEmail(planId, email, tier);
    },
    onSuccess: (result) => {
      qc.setQueryData<PlanMembersResponse | undefined>(queryKey, (current) => {
        if (!current) {
          return current;
        }
        if (current.members.some((member) => member.userId === result.userId)) {
          return current;
        }
        return {
          ...current,
          members: [
            ...current.members,
            {
              userId: result.userId,
              tier: result.tier,
              slug: null,
              displayName: null,
              avatarUrl: null,
            },
          ],
        };
      });
      qc.invalidateQueries({ queryKey });
    },
  });

  const updateTier = useMutation({
    mutationFn: async ({ userId, tier }: { userId: string; tier: PlanMemberTier }) => {
      if (!planId) {
        throw missingPlanIdError();
      }
      await updatePlanMemberTier(planId, userId, tier);
      return { userId, tier };
    },
    onMutate: async ({ userId, tier }) => {
      await qc.cancelQueries({ queryKey });
      const previousData = qc.getQueryData<PlanMembersResponse>(queryKey);
      qc.setQueryData<PlanMembersResponse | undefined>(queryKey, (current) => {
        if (!current) {
          return current;
        }
        return {
          ...current,
          members: current.members.map((member) => (member.userId === userId ? { ...member, tier } : member)),
        };
      });
      return { previousData };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        qc.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey }),
  });

  const removeMember = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      if (!planId) {
        throw missingPlanIdError();
      }
      await removePlanMember(planId, userId);
      return { userId };
    },
    onMutate: async ({ userId }) => {
      await qc.cancelQueries({ queryKey });
      const previousData = qc.getQueryData<PlanMembersResponse>(queryKey);
      qc.setQueryData<PlanMembersResponse | undefined>(queryKey, (current) => {
        if (!current) {
          return current;
        }
        return {
          ...current,
          members: current.members.filter((member) => member.userId !== userId),
        };
      });
      return { previousData };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        qc.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey }),
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
  const queryKey = ["plan_share_link", planId] as const;

  const query = useQuery<PlanShareLink | null>({
    queryKey,
    enabled: Boolean(planId) && enabled,
    queryFn: async () => {
      if (!planId) {
        throw missingPlanIdError();
      }
      const data = await getPlanShareLink(planId);
      if (!data || data.revokedAt) {
        return null;
      }
      return data;
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
    onMutate: async () => {
      await qc.cancelQueries({ queryKey });
      const previousData = qc.getQueryData<PlanShareLink | null>(queryKey);
      qc.setQueryData<PlanShareLink | null>(queryKey, null);
      return { previousData };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData !== undefined) {
        qc.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey }),
  });

  return {
    ...query,
    createLink,
    revokeLink,
  };
}

export type { PlanMemberTier, PlanMemberProfile, PlanMembersResponse, PlanShareLink };
