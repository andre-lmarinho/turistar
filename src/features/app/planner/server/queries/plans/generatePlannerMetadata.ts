import "server-only";

import type { Metadata } from "next";

import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";
import { isUuid } from "@/shared/lib/uuid";

type PlanMetadataRow = {
  title: string | null;
  plan_destinations: Array<{
    destinations: { name: string | null } | null;
  }> | null;
};

/**
 * Builds page metadata for a planner identified by an ID or slug.
 *
 * Resolves the page title by preferring the plan's `title`, then the first
 * destination's `name`, and falls back to `"Planner"` if neither is available.
 *
 * @param identifier - The plan identifier; either a UUID (`id`) or a public slug (`public_slug`)
 * @returns A `Metadata` object whose `title` is `"<resolved title> | Turistar App"`
 */
export async function generatePlannerMetadata(identifier: string): Promise<Metadata> {
  const supabase = createSupabaseServerClient();

  try {
    const { data } = await supabase
      .from<PlanMetadataRow>("plans")
      .select("title, plan_destinations(destinations(name))")
      .eq(isUuid(identifier) ? "id" : "public_slug", identifier)
      .maybeSingle();

    const titleFromPlan = data?.title?.trim();
    const titleFromDest = data?.plan_destinations?.[0]?.destinations?.name?.trim();
    const resolvedTitle = titleFromPlan || titleFromDest || "Planner";

    return { title: `${resolvedTitle} | Turistar App` };
  } catch {
    return { title: "Planner | Turistar App" };
  }
}