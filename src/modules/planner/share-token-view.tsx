"use client";

import { ShareLinkAutoJoin } from "@/features/app/planner/components/share/ShareLinkAutoJoin";
import type { AcceptShareLinkResult } from "@/features/app/planner/server/actions/plans/acceptPlanShareLink";
import { Button } from "@/shared/ui/button";

interface ShareTokenViewProps {
  token: string;
  acceptShareLink: (token: string) => Promise<AcceptShareLinkResult>;
}

/**
 * Render a centered card that prompts the user to sign in or create an account to join a planner using a share token.
 *
 * @param token - The share token that identifies the planner invitation and is used to construct the return path.
 * @param acceptShareLink - Function that accepts the share token and processes the invitation (called by the auto-join handler).
 * @returns The React element containing sign-up / sign-in links (with next path) and the auto-join component for the token.
 */
export function ShareTokenView({ token, acceptShareLink }: ShareTokenViewProps) {
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
        <ShareLinkAutoJoin token={token} acceptShareLink={acceptShareLink} />
      </div>
    </div>
  );
}

interface ShareTokenErrorViewProps {
  message: string;
}

/**
 * Shows an error card when joining a shared planner fails.
 *
 * @param message - The error message to display to the user
 * @returns The rendered error view element containing the message and navigation actions
 */
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