import { createPlanService } from "@/features/plan/services/createPlanService";

import type { AuthedTRPCContext } from "../../../createContext";
import type { UpdatePlanTitleInput } from "./updateTitle.schema";

export async function updatePlanTitleHandler({
  ctx,
  input,
}: {
  ctx: AuthedTRPCContext;
  input: UpdatePlanTitleInput;
}) {
  return createPlanService(ctx.viewer, ctx.supabase).updatePlanTitle(input.planId, input.title);
}
