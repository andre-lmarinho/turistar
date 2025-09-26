// src/features/planner/server/createPlan.ts
'use server';

import { createPlan as createPlanAction } from '@/server/actions/createPlan';

export interface PlannerDestination {
  name: string;
  latitude?: number;
  longitude?: number;
}

export interface CreatePlannerPlanInput {
  title: string;
  destination: PlannerDestination;
  startDate: string;
  endDate: string;
}

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
      start: startDate,
      end: endDate,
    },
  };
}
