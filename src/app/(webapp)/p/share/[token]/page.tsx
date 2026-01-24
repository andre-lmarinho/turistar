import { notFound, redirect } from "next/navigation";

import { acceptShareLink } from "@/features/shareLink/services/ShareLinkService";
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

  const result = await acceptShareLink(trimmed);
  if (!result.success) return <ShareTokenErrorView message={result.error} />;

  redirect(`/p/${result.planId}`);
}
