"use client";

import { ShareLinkAutoJoin } from "@/features/app/planner/components/share/ShareLinkAutoJoin";
import { acceptPlanShareLink } from "@/features/app/planner/server/actions/plans/acceptPlanShareLink";
import { Button } from "@/shared/ui/button";

interface ShareTokenViewProps {
  token: string;
}

export function ShareTokenView({ token }: ShareTokenViewProps) {
  const nextPath = `/p/share/${token}`;

  return (
    <div className="bg-card flex min-h-screen items-center justify-center px-4">
      <div className="border-border bg-background w-full max-w-md rounded-2xl border px-6 py-8 text-center">
        <h1 className="text-foreground text-2xl font-semibold">Join this planner</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Sign in or create an account to accept this invite.
        </p>
        <div className="mt-6 grid gap-2">
          <Button href={`/signup?next=${encodeURIComponent(nextPath)}`}>Create account</Button>
          <Button
            href={`/login?next=${encodeURIComponent(nextPath)}`}
            variant="ghost"
            className="border-border border">
            Sign in
          </Button>
        </div>
        <p className="text-muted-foreground mt-4 text-xs">
          After signing in, return to this link to join the planner.
        </p>
        <ShareLinkAutoJoin token={token} acceptShareLink={acceptPlanShareLink} />
      </div>
    </div>
  );
}

interface ShareTokenErrorViewProps {
  message: string;
}

export function ShareTokenErrorView({ message }: ShareTokenErrorViewProps) {
  return (
    <div className="bg-card flex min-h-screen items-center justify-center px-4">
      <div className="border-border bg-background w-full max-w-md rounded-2xl border px-6 py-8 text-center">
        <h1 className="text-foreground text-2xl font-semibold">Unable to join planner</h1>
        <p className="text-muted-foreground mt-2 text-sm">{message}</p>
        <div className="mt-6 grid gap-2">
          <Button href="/">Back to home</Button>
          <Button href="/login" variant="ghost" className="border-border border">
            Try signing in again
          </Button>
        </div>
      </div>
    </div>
  );
}
