"use server";

import { resolvePlanIdentity } from "@/features/plan/repositories/PlanRepository";
import { fetchProfileByUserId } from "@/features/profile/repositories/ProfileRepository";
import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";

import * as MembersRepository from "../repositories/MembersRepository";
import type { AddMemberResult, ShareMembersData, ShareTier } from "../types";

export async function getMembers(planIdOrSlug: string): Promise<ShareMembersData> {
  const client = createSupabaseServerClient();
  const plan = await resolvePlanIdentity(planIdOrSlug, { client });

  if (!plan) {
    throw new Error("getMembers: plan not found");
  }

  const members = await MembersRepository.fetchMembers(plan.id, { client });
  const ownerId = plan.ownerId ?? members.find((member) => member.tier === "admin")?.userId ?? null;

  // Only fetch owner profile if owner is not already in members list
  if (ownerId && !members.some((member) => member.userId === ownerId)) {
    const ownerProfile = await fetchProfileByUserId(ownerId, { client });
    members.unshift({
      userId: ownerId,
      tier: "admin",
      slug: ownerProfile?.slug ?? null,
      displayName: ownerProfile?.displayName ?? null,
      avatarUrl: ownerProfile?.avatarUrl ?? null,
    });
  }

  return { ownerId, members };
}

export async function addMember(
  planIdOrSlug: string,
  email: string,
  tier: ShareTier
): Promise<AddMemberResult> {
  const client = createSupabaseServerClient();
  const plan = await resolvePlanIdentity(planIdOrSlug, { client });

  if (!plan) {
    throw new Error("addMember: plan not found");
  }

  return MembersRepository.addMemberByEmail(plan.id, email, tier, { client });
}

export async function updateMemberTier(planIdOrSlug: string, userId: string, tier: ShareTier): Promise<void> {
  const client = createSupabaseServerClient();
  const plan = await resolvePlanIdentity(planIdOrSlug, { client });

  if (!plan) {
    throw new Error("updateMemberTier: plan not found");
  }

  await MembersRepository.updateMemberTier(plan.id, userId, tier, { client });
}

export async function removeMember(planIdOrSlug: string, userId: string): Promise<void> {
  const client = createSupabaseServerClient();
  const plan = await resolvePlanIdentity(planIdOrSlug, { client });

  if (!plan) {
    throw new Error("removeMember: plan not found");
  }

  await MembersRepository.removeMember(plan.id, userId, { client });
}

export async function leavePlan(planIdOrSlug: string): Promise<void> {
  const client = createSupabaseServerClient();
  const plan = await resolvePlanIdentity(planIdOrSlug, { client });

  if (!plan) {
    throw new Error("leavePlan: plan not found");
  }

  await MembersRepository.leavePlan(plan.id, { client });
}
