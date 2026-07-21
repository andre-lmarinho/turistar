import "server-only";

import type { Metadata } from "next";

import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";
import { isUuid } from "@/shared/lib/uuid";

export async function generatePlannerMetadata(identifier: string): Promise<Metadata> {
  const supabase = createSupabaseServerClient();

  try {
    const { data } = await supabase
      .from("plans")
      .select("title, destination_name")
      .eq(isUuid(identifier) ? "id" : "public_slug", identifier)
      .maybeSingle();

    const titleFromPlan = data?.title?.trim();
    const titleFromDest = data?.destination_name?.trim();
    const resolvedTitle = titleFromPlan || titleFromDest || "Planner";

    return { title: `${resolvedTitle} | Turistar App` };
  } catch (error) {
    console.error(`[generatePlannerMetadata] Failed for identifier=${identifier}:`, error);
    return { title: "Planner | Turistar App" };
  }
}
