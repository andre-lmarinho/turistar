import { createMembersService } from "@/features/members/services/createMembersService";

import type { AuthedTRPCContext } from "../../../createContext";
import type { UpdateMemberInput } from "./update.schema";

export async function updateMemberHandler({
  ctx,
  input,
}: {
  ctx: AuthedTRPCContext;
  input: UpdateMemberInput;
}) {
  await createMembersService(ctx.supabase).updateMemberTier(input.planId, input.userId, input.tier);
}
