"use server";

import { fetchPlanIdBySlug, fetchShareLinkByPlanId } from "@/features/share/repositories/PlanShareRepository";
import { isUuid } from "@/shared/lib/uuid";

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

  const planId = isUuid(trimmed) ? trimmed : await fetchPlanIdBySlug(trimmed);
  if (!planId) {
    return null;
  }

  const data = await fetchShareLinkByPlanId(planId);
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
