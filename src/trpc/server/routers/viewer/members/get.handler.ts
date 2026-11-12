import { createMembersService } from "@/features/members/services/createMembersService";

import type { AuthedTRPCContext } from "../../../createContext";
import type { GetMembersInput } from "./get.schema";

export async function getMembersHandler({ ctx, input }: { ctx: AuthedTRPCContext; input: GetMembersInput }) {
  return createMembersService(ctx.supabase).getMembers(input.planId);
}
