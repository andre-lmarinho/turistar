import { createMembersService } from "@/features/members/services/createMembersService";

import type { AuthedTRPCContext } from "../../../createContext";
import type { LeavePlanInput } from "./leave.schema";

export async function leavePlanHandler({ ctx, input }: { ctx: AuthedTRPCContext; input: LeavePlanInput }) {
  await createMembersService(ctx.supabase).leavePlan(input.planId);
  return "/";
}
