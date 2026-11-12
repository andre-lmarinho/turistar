import { ProfileRepository } from "@/features/profile/repositories/ProfileRepository";
import { ProfileService } from "@/features/profile/services/ProfileService";
import { createSupabaseServiceRoleClient } from "@/supabase/serviceRole";

import type { CheckUsernameAvailabilityInput } from "./availability.schema";

export async function checkUsernameAvailabilityHandler({ input }: { input: CheckUsernameAvailabilityInput }) {
  const service = new ProfileService(new ProfileRepository(createSupabaseServiceRoleClient()));
  return { available: await service.isUsernameAvailable(input.username) };
}
