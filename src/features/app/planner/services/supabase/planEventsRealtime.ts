"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

export type PlannerRealtimeChannel = ReturnType<SupabaseClient["channel"]>;

export { subscribeToPlanEvents } from "@/features/app/planner/client/planEventsRealtimeClient";
