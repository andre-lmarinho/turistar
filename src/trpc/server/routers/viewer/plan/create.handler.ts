import { createPlanService } from "@/features/plan/services/createPlanService";

import type { AuthedTRPCContext } from "../../../createContext";
import type { CreatePlanInput } from "./create.schema";

export async function createPlanHandler({ ctx, input }: { ctx: AuthedTRPCContext; input: CreatePlanInput }) {
  return createPlanService(ctx.viewer, ctx.supabase).createUserPlan(input);
}
