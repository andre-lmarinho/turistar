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
