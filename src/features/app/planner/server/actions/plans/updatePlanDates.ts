"use server";

import { format } from "date-fns";

import { formatSupabaseError } from "@/shared/lib/supabaseErrors";
import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";

export async function updatePlanDates(planId: string, from: Date, to: Date) {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("plans")
    .update({
      start_date: format(from, "yyyy-MM-dd"),
      end_date: format(to, "yyyy-MM-dd"),
    })
    .eq("id", planId)
    .select("id")
    .single();
  if (error) {
    throw formatSupabaseError({
      operation: "updatePlanDates",
      identifiers: { planId },
      error,
    });
  }
}
