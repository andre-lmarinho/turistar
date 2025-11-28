'use server';

import { requireUser } from '@/shared/lib/auth/session';
import { createPlan as createPlanAction } from '@/server/actions/createPlan';

interface PlannerDestination {
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

interface PlannerRecentPlanPayload {
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

async function executePlanCreation(
  { title, destination, startDate, endDate }: CreatePlannerPlanInput,
  userId?: string
): Promise<CreatePlannerPlanResult> {
  const { id, publicSlug, editToken } = await createPlanAction(
    title,
    {
      name: destination.name,
      latitude: destination.latitude,
      longitude: destination.longitude,
    },
    startDate,
    endDate,
    userId
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

export async function createPlannerPlan(
  input: CreatePlannerPlanInput
): Promise<CreatePlannerPlanResult> {
  return executePlanCreation(input);
}

export async function createUserPlan(
  input: CreatePlannerPlanInput
): Promise<CreatePlannerPlanResult> {
  const user = await requireUser();
  return executePlanCreation(input, user.id);
}
