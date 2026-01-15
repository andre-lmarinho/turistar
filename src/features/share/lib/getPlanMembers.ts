"use server";

import { resolvePlanId } from "@/features/share/lib/resolvePlanId";
import {
  fetchPlanMembersWithProfiles,
  fetchProfileById,
} from "@/features/share/repositories/PlanMembersRepository";
import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";

type PlanMemberTier = "admin" | "member";

export type PlanMemberProfile = {
  userId: string;
  tier: PlanMemberTier;
  slug: string | null;
  displayName: string | null;
  avatarUrl: string | null;
};

export type PlanMembersResponse = {
  ownerId: string | null;
  members: PlanMemberProfile[];
};

export async function getPlanMembers(planIdOrSlug: string): Promise<PlanMembersResponse> {
  const supabase = createSupabaseServerClient();
  const planRow = await resolvePlanId(planIdOrSlug, supabase);

  if (!planRow) {
    throw new Error(`getPlanMembers: plan not found or access denied (planIdOrSlug=${planIdOrSlug})`);
  }

  const ownerId = planRow.ownerId ?? null;
  const planId = planRow.id;

  const [memberProfiles, ownerProfile] = await Promise.all([
    fetchPlanMembersWithProfiles(planId, { client: supabase }),
    ownerId ? fetchProfileById(ownerId, { client: supabase }) : Promise.resolve(null),
  ]);

  const members = memberProfiles.map((row) => ({
    userId: row.userId,
    tier: row.tier,
    slug: row.profile?.slug ?? null,
    displayName: row.profile?.displayName ?? null,
    avatarUrl: row.profile?.avatarUrl ?? null,
  }));

  const resolvedOwnerId = ownerId ?? members.find((member) => member.tier === "admin")?.userId ?? null;

  if (resolvedOwnerId && !members.some((member) => member.userId === resolvedOwnerId)) {
    members.unshift({
      userId: resolvedOwnerId,
      tier: "admin",
      slug: ownerProfile?.slug ?? null,
      displayName: ownerProfile?.displayName ?? null,
      avatarUrl: ownerProfile?.avatarUrl ?? null,
    });
  }

  return { ownerId: resolvedOwnerId, members };
}
