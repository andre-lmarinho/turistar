"use server";

import { format } from "date-fns";

import { formatSupabaseError } from "@/shared/lib/supabaseErrors";
import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";

export async function updatePlanDates(planId: string, editToken: string, from: Date, to: Date) {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.rpc("update_plan_dates", {
    _plan_id: planId,
    _edit_token: editToken,
    _start_date: format(from, "yyyy-MM-dd"),
    _end_date: format(to, "yyyy-MM-dd"),
  });
  if (error) {
    throw formatSupabaseError({
      operation: "updatePlanDates",
      identifiers: { planId },
      error,
    });
  }
}
