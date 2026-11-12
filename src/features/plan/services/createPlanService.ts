import type { SupabaseClient } from "@supabase/supabase-js";
import type { Viewer } from "@/features/auth/lib/session";
import { BudgetRepository } from "@/features/budget/repositories/BudgetRepository";
import { ProfileRepository } from "@/features/profile/repositories/ProfileRepository";
import { SnapshotsRepository } from "@/features/snapshots/repositories/SnapshotsRepository";
import { SnapshotsService } from "@/features/snapshots/services/SnapshotsService";
import { createSupabaseServerClient } from "@/supabase/server";
import type { Database } from "@/supabase/types";

import { PlanRepository } from "../repositories/PlanRepository";
import { PlanService } from "./PlanService";

export function createPlanService(
  viewer: Viewer | null = null,
  client: SupabaseClient<Database> = createSupabaseServerClient()
): PlanService {
  return new PlanService(
    new PlanRepository(client),
    new BudgetRepository(client),
    new ProfileRepository(client),
    new SnapshotsService(new SnapshotsRepository(client)),
    viewer
  );
}
