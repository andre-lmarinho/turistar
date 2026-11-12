import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { PlanRepository } from "@/features/plan/repositories/PlanRepository";
import { ProfileRepository } from "@/features/profile/repositories/ProfileRepository";
import type { Database } from "@/supabase/types";

import { MembersRepository } from "../repositories/MembersRepository";
import { MembersService } from "./MembersService";

export function createMembersService(client: SupabaseClient<Database>): MembersService {
  return new MembersService(
    new MembersRepository(client),
    new PlanRepository(client),
    new ProfileRepository(client)
  );
}
