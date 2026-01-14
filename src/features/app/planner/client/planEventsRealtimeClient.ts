"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { PlanEvent } from "@/features/app/planner/domain/types/PlanEvent";
import { supabase } from "@/shared/lib/supabaseClient";

import { EventRowSchema, mapEvent } from "../services/supabase/planEventsSchemas";

type PlannerRealtimeChannel = ReturnType<SupabaseClient["channel"]>;

export function subscribeToPlanEvents(
  planId: string,
  handler: (event: PlanEvent) => void,
  client: SupabaseClient = supabase
): PlannerRealtimeChannel {
  const channel = client
    .channel(`plan-events-${planId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "plan_events", filter: `plan_id=eq.${planId}` },
      (payload: { new: unknown }) => {
        const parsed = EventRowSchema.parse(payload.new);
        handler(mapEvent(parsed));
      }
    )
    .subscribe();
  return channel;
}
