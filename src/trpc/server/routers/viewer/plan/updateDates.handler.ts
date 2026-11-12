import { createPlanService } from "@/features/plan/services/createPlanService";

import type { AuthedTRPCContext } from "../../../createContext";
import type { UpdatePlanDatesInput } from "./updateDates.schema";

export async function updatePlanDatesHandler({
  ctx,
  input,
}: {
  ctx: AuthedTRPCContext;
  input: UpdatePlanDatesInput;
}) {
  return createPlanService(ctx.viewer, ctx.supabase).updatePlanDates(
    input.planId,
    new Date(input.from),
    new Date(input.to)
  );
}
