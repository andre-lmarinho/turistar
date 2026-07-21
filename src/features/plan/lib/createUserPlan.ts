"use server";

import { fetchGeoapifyPlaceDetails } from "@/features/search/services/GeoapifyService";
import { fetchWikidataImage } from "@/features/search/services/WikidataService";
import { requireUser } from "@/shared/lib/auth/session";

import { createPlan } from "./createPlan";
import { setPlanVisibility } from "./setPlanVisibility";
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
  isPublic?: boolean;
}

export interface CreatePlannerPlanResult {
  planId: string;
  publicSlug: string;
}

export async function createUserPlan(input: CreatePlannerPlanInput): Promise<CreatePlannerPlanResult> {
  const user = await requireUser();
  const { title, destination, startDate, endDate, isPublic } = input;

  // Start fetching cover image asynchronously without blocking plan creation
  // Same pattern as activities: placeId -> wikidataId -> imageUrl
  // NOTE: In serverless/edge runtimes, this fire-and-forget pattern may not execute
  // if the runtime freezes pending promises after the response is returned.
  // This is acceptable as cover images are best-effort enhancement.
  const coverImagePromise = destination.placeId
    ? fetchGeoapifyPlaceDetails(destination.placeId)
        .then((details) => (details.wikidataId ? fetchWikidataImage(details.wikidataId) : undefined))
        .catch((error) => {
          console.error("Failed to fetch cover image metadata", {
            placeId: destination.placeId,
            error,
          });
          return undefined;
        })
    : Promise.resolve(undefined);

  // Create the plan immediately without waiting for the cover image
  const { id, publicSlug } = await createPlan(
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

  // Plans are created private (is_public defaults to false); publish only when asked.
  // Best-effort: the plan is already persisted, so a publish failure must not fail creation
  // (that would surface as "Failed to create plan", prompt a retry, and leave a duplicate).
  // The owner can still publish later from the Share dialog.
  if (isPublic) {
    try {
      await setPlanVisibility(id, true);
    } catch (error) {
      console.error("Failed to publish plan on creation; left private", { planId: id, error });
    }
  }

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
      console.error("Failed to update cover image", {
        planId: id,
        error,
      });
    });

  return {
    planId: id,
    publicSlug,
  };
}
