"use server";

import { resolvePlanId } from "@/features/share/lib/resolvePlanId";
import { fetchShareLinkByPlanId } from "@/features/share/repositories/PlanShareRepository";

export type PlanShareLink = {
  token: string;
  createdAt: string;
  createdBy: string;
  revokedAt: string | null;
};

export async function getPlanShareLink(planIdOrSlug: string): Promise<PlanShareLink | null> {
  const trimmed = planIdOrSlug.trim();
  if (!trimmed) {
    return null;
  }

  const planRow = await resolvePlanId(trimmed);
  if (!planRow) {
    return null;
  }

  const data = await fetchShareLinkByPlanId(planRow.id);
  if (!data) {
    return null;
  }

  return {
    token: data.token,
    createdAt: data.created_at,
    createdBy: data.created_by,
    revokedAt: data.revoked_at,
  };
}
