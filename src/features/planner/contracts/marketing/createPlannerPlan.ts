// src/features/planner/contracts/marketing/createPlannerPlan.ts
'use server';

import {
  createPlannerPlan as createPlannerPlanInternal,
  type CreatePlannerPlanInput,
  type CreatePlannerPlanResult,
  type PlannerDestination,
  type PlannerRecentPlanPayload,
} from '@/features/planner/server/createPlan';

export type {
  CreatePlannerPlanInput,
  CreatePlannerPlanResult,
  PlannerDestination,
  PlannerRecentPlanPayload,
};

export async function createPlannerPlan(
  input: CreatePlannerPlanInput
): Promise<CreatePlannerPlanResult> {
  return createPlannerPlanInternal(input);
}
