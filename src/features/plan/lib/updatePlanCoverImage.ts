"use server";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";

/**
 * Updates the cover image of an existing plan
 *
 * This function is designed to be called asynchronously after plan creation
 * to avoid blocking the user while fetching external images.
 *
 * @param planId - The UUID of the plan to update
 * @param coverImageUrl - The URL of the cover image
 * @param client - Optional Supabase client (defaults to server client)
 * @returns void - Errors are logged but not thrown to avoid breaking async updates
 */
export async function updatePlanCoverImage(
  planId: string,
  coverImageUrl: string,
  client?: SupabaseClient
): Promise<void> {
  try {
    const supabase = client ?? createSupabaseServerClient();
    const { error } = await supabase.from("plans").update({ cover_image: coverImageUrl }).eq("id", planId);

    if (error) {
      console.error(`Failed to update plan cover image: planId=${planId}`, error);
    }
  } catch (error) {
    console.error(`Unexpected error updating plan cover image: planId=${planId}`, error);
  }
}
