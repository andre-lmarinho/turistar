"use client";

import { useShareLinkAutoJoin } from "@/features/app/planner/hooks/ui/useShareLinkAutoJoin";
import type { AcceptShareLinkResult } from "@/features/app/planner/server/actions/plans/acceptPlanShareLink";

type ShareLinkAutoJoinProps = {
  token: string;
  acceptShareLink: (token: string) => Promise<AcceptShareLinkResult>;
};

/**
 * Renders a status message while attempting to auto-join a planner using a share link.
 *
 * @param token - The share link token used to attempt joining the planner.
 * @param acceptShareLink - Function that accepts the share link token and performs the join operation.
 * @returns A paragraph element with a joining message or an error message, or `null` when no status is shown.
 */
export function ShareLinkAutoJoin({ token, acceptShareLink }: ShareLinkAutoJoinProps) {
  const status = useShareLinkAutoJoin({ token, acceptShareLink });

  if (status === "joining") {
    return <p className="text-muted-foreground mt-4 text-xs">Joining this planner...</p>;
  }

  if (status === "error") {
    return (
      <p className="text-muted-foreground mt-4 text-xs">
        We could not join automatically. Please refresh the page or try again.
      </p>
    );
  }

  return null;
}