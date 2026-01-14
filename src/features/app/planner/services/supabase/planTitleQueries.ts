import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { formatSupabaseError } from "@/shared/lib/supabaseErrors";
import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";

type PlanTitleRow = { title: string | null };

export async function fetchPlanTitle(planId: string, client?: SupabaseClient): Promise<string | null> {
  const supabase = client ?? createSupabaseServerClient();
  const { data, error } = await supabase
    .from("plans")
    .select<PlanTitleRow>("title")
    .eq("id", planId)
    .single();

  if (error) {
    throw formatSupabaseError({
      operation: "fetchPlanTitle",
      identifiers: { planId },
      error,
    });
  }
  return data?.title ?? null;
}
