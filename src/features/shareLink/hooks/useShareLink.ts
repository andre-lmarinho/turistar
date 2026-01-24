"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as ShareLinkService from "../services/ShareLinkService";
import type { ShareLink } from "../types";

const keys = {
  link: (planId: string) => ["share", "link", planId] as const,
};

type UseShareLinkOptions = {
  enabled?: boolean;
};

export function useShareLink(planId: string, options: UseShareLinkOptions = {}) {
  const enabled = options.enabled ?? true;
  const qc = useQueryClient();
  const queryKey = keys.link(planId);

  const query = useQuery<ShareLink | null>({
    queryKey,
    enabled: Boolean(planId) && enabled,
    queryFn: () => ShareLinkService.getShareLink(planId),
  });

  const createLink = useMutation({
    mutationFn: () => ShareLinkService.createShareLink(planId),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  const revokeLink = useMutation({
    mutationFn: () => ShareLinkService.revokeShareLink(planId),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey });
      const previous = qc.getQueryData<ShareLink | null>(queryKey);
      qc.setQueryData<ShareLink | null>(queryKey, null);
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous !== undefined) qc.setQueryData(queryKey, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey }),
  });

  return {
    ...query,
    createLink,
    revokeLink,
  };
}
