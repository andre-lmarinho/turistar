"use client";

import { useShareLinkAutoJoin } from "@/features/share/hook/useShareLinkAutoJoin";
import type { AcceptShareLinkResult } from "@/features/share/lib/acceptPlanShareLink";

type ShareLinkAutoJoinProps = {
  token: string;
  acceptShareLink: (token: string) => Promise<AcceptShareLinkResult>;
};

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
