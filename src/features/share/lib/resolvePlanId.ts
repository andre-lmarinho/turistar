"use server";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { PlanIdentityRecord } from "@/features/share/repositories/PlanMembersRepository";
import {
  fetchPlanIdentityById,
  fetchPlanIdentityBySlug,
} from "@/features/share/repositories/PlanMembersRepository";
import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";
import { isUuid } from "@/shared/lib/uuid";

export async function resolvePlanId(
  planIdOrSlug: string,
  client?: SupabaseClient
): Promise<PlanIdentityRecord | null> {
  const trimmed = planIdOrSlug.trim();
  if (!trimmed) {
    return null;
  }

  const supabase = client ?? createSupabaseServerClient();

  if (isUuid(trimmed)) {
    const planById = await fetchPlanIdentityById(trimmed, { client: supabase });
    if (planById) {
      return planById;
    }
  }

  return fetchPlanIdentityBySlug(trimmed, { client: supabase });
}
