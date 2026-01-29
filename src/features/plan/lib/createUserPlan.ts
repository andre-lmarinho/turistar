"use server";

import { fetchGeoapifyPlaceDetails } from "@/features/search/services/GeoapifyService";
import { fetchWikidataImage } from "@/features/search/services/WikidataService";
import { requireUser } from "@/shared/lib/auth/session";

import { createPlan } from "./createPlan";
import { updatePlanCoverImage } from "./updatePlanCoverImage";

interface PlannerDestination {
  name: string;
  latitude?: number;
  longitude?: number;
  country?: string;
  placeId?: string;
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

  // Start fetching cover image asynchronously without blocking plan creation
  // Same pattern as activities: placeId -> wikidataId -> imageUrl
  // NOTE: In serverless/edge runtimes, this fire-and-forget pattern may not execute
  // if the runtime freezes pending promises after the response is returned.
  // This is acceptable as cover images are best-effort enhancement.
  const coverImagePromise = destination.placeId
    ? fetchGeoapifyPlaceDetails(destination.placeId)
        .then((details) => (details.wikidataId ? fetchWikidataImage(details.wikidataId) : undefined))
        .catch((error) => {
          console.error(`Failed to fetch cover image metadata: placeId=${destination.placeId}`, error);
          return undefined;
        })
    : Promise.resolve(undefined);

  // Create the plan immediately without waiting for the cover image
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
    { userId: user.id } // Don't wait for cover image on initial creation
  );

  // Update cover image in the background after plan is created
  // Errors are logged but not thrown to avoid breaking the response
  coverImagePromise
    .then((coverImageUrl) => {
      if (coverImageUrl) {
        return updatePlanCoverImage(id, coverImageUrl);
      }
    })
    .catch((error) => {
      // Silently ignore - errors already logged in updatePlanCoverImage
      console.error(`Failed to update cover image: planId=${id}`, error);
    });

  return {
    planId: id,
    publicSlug,
    editToken,
  };
}
