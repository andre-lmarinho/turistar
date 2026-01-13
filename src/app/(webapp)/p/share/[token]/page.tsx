import { notFound, redirect } from "next/navigation";

import { acceptPlanShareLink } from "@/features/app/planner/server/actions/plans/acceptPlanShareLink";
import { ShareTokenErrorView, ShareTokenView } from "@/modules/planner/share-token-view";
import { getCurrentUser } from "@/shared/lib/auth/session";
import { isUuid } from "@/shared/lib/uuid";

export const dynamic = "force-dynamic";

/**
 * Handle a share-token URL by validating the token, rendering the appropriate share view, or redirecting to the accepted plan.
 *
 * If the token is missing or not a valid UUID this page serves a 404. If no user is authenticated, it renders the share view with an accept handler; if a user is authenticated it attempts to accept the share, rendering an error view on failure or redirecting to the plan page on success.
 *
 * @param params - Promise resolving to an object containing the route `token` string
 * @returns A React element for the share page or error view, or a redirect to the plan page when the token is accepted
 */
export default async function PlannerShareLinkPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const trimmed = token?.trim();
  if (!trimmed || !isUuid(trimmed)) notFound();

  const user = await getCurrentUser();
  if (!user) return <ShareTokenView token={trimmed} acceptShareLink={acceptPlanShareLink} />;

  const result = await acceptPlanShareLink(trimmed);
  if (!result.success) return <ShareTokenErrorView message={result.error} />;

  redirect(`/p/${result.planId}`);
}