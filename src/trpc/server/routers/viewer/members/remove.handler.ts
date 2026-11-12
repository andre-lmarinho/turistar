import { createMembersService } from "@/features/members/services/createMembersService";

import type { AuthedTRPCContext } from "../../../createContext";
import type { RemoveMemberInput } from "./remove.schema";

export async function removeMemberHandler({
  ctx,
  input,
}: {
  ctx: AuthedTRPCContext;
  input: RemoveMemberInput;
}) {
  await createMembersService(ctx.supabase).removeMember(input.planId, input.userId);
}
