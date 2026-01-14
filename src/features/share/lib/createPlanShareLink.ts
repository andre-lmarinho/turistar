"use server";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createPlanShareLink as createPlanShareLinkRpc } from "@/features/share/repositories/PlanShareRepository";
import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";

export async function createPlanShareLink(
  planId: string,
  client: SupabaseClient = createSupabaseServerClient()
): Promise<string> {
  const shareLink = await createPlanShareLinkRpc(planId, { client });

  if (!shareLink) {
    throw new Error(`createPlanShareLink failed: planId=${planId}`);
  }

  return shareLink;
}
