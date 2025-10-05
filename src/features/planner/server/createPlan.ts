// src/features/planner/server/createPlan.ts
'use server';

import { createPlan as createPlanAction } from '@/server/actions/createPlan';
import type { CreatePlanInput, PlanDestinationInput } from '@/server/actions/planSchemas';

export type PlannerDestination = PlanDestinationInput;

export type CreatePlannerPlanInput = CreatePlanInput;

export interface PlannerRecentPlanPayload {
  id: string;
  slug: string;
  dest: string;
  start: string;
  end: string;
}

export interface CreatePlannerPlanResult {
  planId: string;
  publicSlug: string;
  editToken: string;
  recentPlan: PlannerRecentPlanPayload;
}

export async function createPlannerPlan({
  title,
  destination,
  startDate,
  endDate,
}: CreatePlannerPlanInput): Promise<CreatePlannerPlanResult> {
  const { id, publicSlug, editToken } = await createPlanAction(
    title,
    {
      name: destination.name,
      latitude: destination.latitude,
      longitude: destination.longitude,
    },
    startDate,
    endDate
  );

  return {
    planId: id,
    publicSlug,
    editToken,
    recentPlan: {
      id,
      slug: publicSlug,
      dest: destination.name,
      start: typeof startDate === 'string' ? startDate : new Date(startDate).toISOString(),
      end: typeof endDate === 'string' ? endDate : new Date(endDate).toISOString(),
    },
  };
}
