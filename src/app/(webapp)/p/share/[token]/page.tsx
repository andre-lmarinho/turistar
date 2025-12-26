import { notFound, redirect } from 'next/navigation';

import { acceptPlanShareLink } from '@/server/actions/plans/acceptPlanShareLink';
import { getCurrentUser } from '@/shared/lib/auth/session';
import { Button } from '@/shared/ui/button';
import { ShareLinkAutoJoin } from '@/features/app/planner/components/share/ShareLinkAutoJoin';

export const dynamic = 'force-dynamic';

function looksLikeUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function isRedirectError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }
  const digest = (error as { digest?: string }).digest;
  return typeof digest === 'string' && digest.includes('NEXT_REDIRECT');
}

export default async function PlannerShareLinkPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const trimmed = token?.trim();

  if (!trimmed || !looksLikeUuid(trimmed)) {
    notFound();
  }

  const user = await getCurrentUser();
  if (!user) {
    const nextPath = `/p/share/${trimmed}`;
    return (
      <div className="bg-card flex min-h-screen items-center justify-center px-4">
        <div className="border-border bg-background w-full max-w-md rounded-2xl border px-6 py-8 text-center">
          <h1 className="text-foreground text-2xl font-semibold">Join this planner</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Sign in or create an account to accept this invite.
          </p>
          <div className="mt-6 grid gap-2">
            <Button href={`/signup?next=${encodeURIComponent(nextPath)}`}>
              Create account
            </Button>
            <Button
              href={`/login?next=${encodeURIComponent(nextPath)}`}
              variant="ghost"
              className="border-border border"
            >
              Sign in
            </Button>
          </div>
          <p className="text-muted-foreground mt-4 text-xs">
            After signing in, return to this link to join the planner.
          </p>
          <ShareLinkAutoJoin token={trimmed} acceptShareLink={acceptPlanShareLink} />
        </div>
      </div>
    );
  }

  let planId: string;
  try {
    planId = await acceptPlanShareLink(trimmed);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    const message =
      typeof error === 'object' && error && 'message' in error
        ? String((error as { message?: unknown }).message ?? '')
        : String(error);
    const details =
      typeof error === 'object' && error && 'details' in error
        ? String((error as { details?: unknown }).details ?? '')
        : '';
    const code =
      typeof error === 'object' && error && 'code' in error
        ? String((error as { code?: unknown }).code ?? '')
        : '';
    const normalized = `${message} ${details}`.toLowerCase();
    let friendlyMessage = message || 'We could not accept this invite right now.';

    if (normalized.includes('invalid') || normalized.includes('expired')) {
      friendlyMessage = 'This share link is invalid or has expired.';
    } else if (normalized.includes('not authenticated') || code === '401') {
      friendlyMessage = 'Please sign in to join this planner.';
    } else if (
      normalized.includes('not registered') ||
      normalized.includes('user_not_registered') ||
      code === '23503' ||
      code === 'USER_NOT_REGISTERED'
    ) {
      friendlyMessage =
        'Your account is not fully set up yet. Please finish signing up, then try again.';
    }
    return (
      <div className="bg-card flex min-h-screen items-center justify-center px-4">
        <div className="border-border bg-background w-full max-w-md rounded-2xl border px-6 py-8 text-center">
          <h1 className="text-foreground text-2xl font-semibold">Unable to join planner</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {friendlyMessage}
          </p>
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

  redirect(`/p/${planId}`);
}
