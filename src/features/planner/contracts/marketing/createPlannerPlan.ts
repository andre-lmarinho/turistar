'use server';

import {
  createPlannerPlan as createPlannerPlanInternal,
  type CreatePlannerPlanInput,
  type CreatePlannerPlanResult,
} from '@/features/planner/server/createPlan';

export async function createPlannerPlan(
  input: CreatePlannerPlanInput
): Promise<CreatePlannerPlanResult> {
  return createPlannerPlanInternal(input);
}
