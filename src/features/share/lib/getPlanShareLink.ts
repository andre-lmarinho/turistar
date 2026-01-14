"use server";

import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";
import type { Database } from "@/shared/types/supabase";

export type PlanShareLink = {
  token: string;
  createdAt: string;
  createdBy: string;
  revokedAt: string | null;
};

type PlanShareLinkRow = Pick<
  Database["public"]["Tables"]["plan_share_links"]["Row"],
  "token" | "created_at" | "created_by" | "revoked_at"
>;

type PlanIdRow = Pick<Database["public"]["Tables"]["plans"]["Row"], "id">;

export async function getPlanShareLink(planIdOrSlug: string): Promise<PlanShareLink | null> {
  const supabase = createSupabaseServerClient();
  const trimmed = planIdOrSlug.trim();
  if (!trimmed) {
    return null;
  }

  const looksLikeUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    trimmed
  );

  let planId = trimmed;
  if (!looksLikeUuid) {
    const { data: planRow, error: planError } = await supabase
      .from("plans")
      .select<PlanIdRow>("id")
      .eq("public_slug", trimmed)
      .maybeSingle();
    if (planError) {
      throw new Error(
        `Failed to fetch plan by slug "${trimmed}": ${planError instanceof Error ? planError.message : String(planError)}`
      );
    }
    if (!planRow) {
      return null;
    }
    planId = planRow.id;
  }

  const { data, error } = await supabase
    .from("plan_share_links")
    .select<PlanShareLinkRow>("token, created_at, created_by, revoked_at")
    .eq("plan_id", planId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to fetch share link for plan "${planId}": ${error instanceof Error ? error.message : String(error)}`
    );
  }

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
