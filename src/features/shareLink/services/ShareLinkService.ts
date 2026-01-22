"use server";

import { ensureProfile } from "@/features/auth/lib/ensureProfile";
import { resolvePlanIdentity } from "@/features/plan/repositories/PlanRepository";
import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";

import * as ShareLinkRepository from "../repositories/ShareLinkRepository";
import type { ShareLink } from "../types";

export async function getShareLink(planIdOrSlug: string): Promise<ShareLink | null> {
  const trimmed = planIdOrSlug.trim();
  if (!trimmed) return null;

  const client = createSupabaseServerClient();
  const plan = await resolvePlanIdentity(trimmed, { client });
  if (!plan) return null;

  const link = await ShareLinkRepository.fetchShareLink(plan.id, { client });
  if (!link || link.revokedAt) return null;

  return link;
}

export async function createShareLink(planIdOrSlug: string): Promise<string> {
  const client = createSupabaseServerClient();
  const plan = await resolvePlanIdentity(planIdOrSlug, { client });

  if (!plan) {
    throw new Error("createShareLink: plan not found");
  }

  return ShareLinkRepository.createShareLink(plan.id, { client });
}

export async function revokeShareLink(planIdOrSlug: string): Promise<boolean> {
  const client = createSupabaseServerClient();
  const plan = await resolvePlanIdentity(planIdOrSlug, { client });

  if (!plan) {
    throw new Error("revokeShareLink: plan not found");
  }

  return ShareLinkRepository.revokeShareLink(plan.id, { client });
}

export type AcceptShareLinkResponse = { success: true; planId: string } | { success: false; error: string };

export async function acceptShareLink(token: string): Promise<AcceptShareLinkResponse> {
  const trimmed = token.trim();
  if (!trimmed) {
    return { success: false, error: "Invalid token." };
  }

  const client = createSupabaseServerClient();

  try {
    await ensureProfile({ client });
    const planId = await ShareLinkRepository.acceptShareLink(trimmed, { client });

    if (!planId) {
      return { success: false, error: "We could not accept this invite right now." };
    }

    return { success: true, planId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (message.includes("Invalid or expired")) {
      return { success: false, error: "This share link is invalid or has expired." };
    }
    if (message.includes("Not authenticated")) {
      return { success: false, error: "Please sign in to join this planner." };
    }

    return { success: false, error: "We could not accept this invite right now." };
  }
}
