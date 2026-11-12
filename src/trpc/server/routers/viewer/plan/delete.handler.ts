import { createPlanService } from "@/features/plan/services/createPlanService";

import type { AuthedTRPCContext } from "../../../createContext";
import type { DeletePlanInput } from "./delete.schema";

export async function deletePlanHandler({ ctx, input }: { ctx: AuthedTRPCContext; input: DeletePlanInput }) {
  return createPlanService(ctx.viewer, ctx.supabase).deletePlan(input.planId);
}
