"use server";

import { ensureProfile } from "@/features/auth/lib/ensureProfile";
import { acceptPlanShareLink as acceptPlanShareLinkRpc } from "@/features/share/repositories/PlanShareRepository";
import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";

export type AcceptShareLinkResult = { success: true; planId: string } | { success: false; error: string };

export async function acceptPlanShareLink(token: string): Promise<AcceptShareLinkResult> {
  const supabase = createSupabaseServerClient();

  try {
    await ensureProfile({ client: supabase });
    const planId = await acceptPlanShareLinkRpc(token, { client: supabase });

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
