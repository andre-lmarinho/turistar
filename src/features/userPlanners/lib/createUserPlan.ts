"use server";

import { createPlan } from "@/features/userPlanners/lib/createPlan";
import { requireUser } from "@/shared/lib/auth/session";

interface PlannerDestination {
  name: string;
  latitude?: number;
  longitude?: number;
  country?: string;
}

export interface CreatePlannerPlanInput {
  title: string;
  destination: PlannerDestination;
  startDate: string;
  endDate: string;
}

export interface CreatePlannerPlanResult {
  planId: string;
  publicSlug: string;
  editToken: string;
}

export async function createUserPlan(input: CreatePlannerPlanInput): Promise<CreatePlannerPlanResult> {
  const user = await requireUser();
  const { title, destination, startDate, endDate } = input;

  const { id, publicSlug, editToken } = await createPlan(
    title,
    {
      name: destination.name,
      latitude: destination.latitude,
      longitude: destination.longitude,
      country: destination.country,
    },
    startDate,
    endDate,
    user.id
  );

  return {
    planId: id,
    publicSlug,
    editToken,
  };
}
