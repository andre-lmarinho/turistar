import { createMembersService } from "@/features/members/services/createMembersService";

import type { AuthedTRPCContext } from "../../../createContext";
import type { AddMemberInput } from "./add.schema";

export async function addMemberHandler({ ctx, input }: { ctx: AuthedTRPCContext; input: AddMemberInput }) {
  return createMembersService(ctx.supabase).addMember(input.planId, input.email, input.tier);
}
