'use client';

import { useShareLinkAutoJoin } from '@/features/app/planner/hooks/ui/useShareLinkAutoJoin';

type ShareLinkAutoJoinProps = {
  token: string;
  acceptShareLink: (token: string) => Promise<string>;
};

export function ShareLinkAutoJoin({ token, acceptShareLink }: ShareLinkAutoJoinProps) {
  const status = useShareLinkAutoJoin({ token, acceptShareLink });

  if (status === 'joining') {
    return (
      <p className="text-muted-foreground mt-4 text-xs">
        Joining this planner...
      </p>
    );
  }

  if (status === 'error') {
    return (
      <p className="text-muted-foreground mt-4 text-xs">
        We could not join automatically. Please refresh the page or try again.
      </p>
    );
  }

  return null;
}
