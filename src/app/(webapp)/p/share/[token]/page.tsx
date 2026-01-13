import { notFound, redirect } from "next/navigation";

import { acceptPlanShareLink } from "@/features/app/planner/server/actions/plans/acceptPlanShareLink";
import { ShareTokenErrorView, ShareTokenView } from "@/modules/planner/share-token-view";
import { getCurrentUser } from "@/shared/lib/auth/session";
import { isUuid } from "@/shared/lib/uuid";

export const dynamic = "force-dynamic";

export default async function PlannerShareLinkPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const trimmed = token?.trim();
  if (!trimmed || !isUuid(trimmed)) notFound();

  const user = await getCurrentUser();
  if (!user) return <ShareTokenView token={trimmed} />;

  const result = await acceptPlanShareLink(trimmed);
  if (!result.success) return <ShareTokenErrorView message={result.error} />;

  redirect(`/p/${result.planId}`);
}
