"use server";

import { acceptPlanShareLink as acceptPlanShareLinkRpc } from "@/features/app/planner/server/repositories/PlanShareRepository";
import { ensureProfile } from "@/features/auth/lib/ensureProfile";
import { supabaseServer } from "@/shared/lib/supabaseServer";

export type AcceptShareLinkResult = { success: true; planId: string } | { success: false; error: string };

/**
 * Accepts a planner share link token on behalf of the current authenticated user.
 *
 * Ensures the caller has an active profile, invokes the server RPC to accept the share link, and maps outcomes to a structured result.
 *
 * @param token - The share link token extracted from the invite link
 * @returns `{ success: true; planId: string }` when the invite is accepted and the plan ID is returned, or `{ success: false; error: string }` with a user-facing error message otherwise
 */
export async function acceptPlanShareLink(token: string): Promise<AcceptShareLinkResult> {
  const supabase = supabaseServer();

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