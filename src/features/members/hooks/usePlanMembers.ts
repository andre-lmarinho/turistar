"use client";

import { useRouter } from "next/navigation";

import { trpc } from "@/trpc/react";

/**
 * Member roster query plus the optimistic add/update/remove/leave coordination.
 * Leaves redirect to the returned dashboard path; leave cache is reset instead of
 * invalidated because the viewer no longer has access to the plan.
 */
export function usePlanMembers(planId: string, enabled: boolean) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const query = trpc.viewer.members.get.useQuery({ planId }, { enabled });

  const addMutation = trpc.viewer.members.add.useMutation({
    onSuccess: (result) => {
      utils.viewer.members.get.setData({ planId }, (current) => {
        if (!current || current.members.some((member) => member.userId === result.userId)) return current;
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
    },
    onSettled: () => utils.viewer.members.get.invalidate({ planId }),
  });

  const updateMutation = trpc.viewer.members.update.useMutation({
    onMutate: async ({ userId, tier }) => {
      await utils.viewer.members.get.cancel({ planId });
      const previous = utils.viewer.members.get.getData({ planId });
      utils.viewer.members.get.setData({ planId }, (current) => {
        if (!current) return current;
        return {
          ...current,
          members: current.members.map((member) => (member.userId === userId ? { ...member, tier } : member)),
        };
      });
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        utils.viewer.members.get.setData({ planId }, context.previous);
      }
    },
    onSettled: () => utils.viewer.members.get.invalidate({ planId }),
  });

  const removeMutation = trpc.viewer.members.remove.useMutation({
    onSuccess: (_result, { userId }) => {
      utils.viewer.members.get.setData(
        { planId },
        (current) =>
          current && { ...current, members: current.members.filter((member) => member.userId !== userId) }
      );
    },
    onSettled: () => utils.viewer.members.get.invalidate({ planId }),
  });

  const leaveMutation = trpc.viewer.members.leave.useMutation({
    onSuccess: (redirectTo) => {
      router.push(redirectTo);
      router.refresh();
      void utils.viewer.members.get.reset({ planId });
    },
  });

  return {
    ...query,
    isMutating:
      addMutation.isPending ||
      updateMutation.isPending ||
      removeMutation.isPending ||
      leaveMutation.isPending,
    addMember: addMutation,
    updateTier: updateMutation,
    removeMember: removeMutation,
    leave: leaveMutation,
  };
}
