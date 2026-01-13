"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { usePlanEditTokens } from "@/features/app/planner/hooks/data/usePlanEditTokens";
import type { PlannerExperience } from "@/features/app/planner/server/queries/plans/getPlannerExperience";
import { PlannerWorkspace } from "@/modules/planner/components/PlannerWorkspace";

interface PlanIdViewProps {
  experience: PlannerExperience;
}

/**
 * Render a PlannerWorkspace for the provided PlannerExperience and handle related side effects.
 *
 * Performs two side effects: cleans up the URL when a slug is present and query parameters exist, and persists an edit token when both `planId` and `editToken` are available.
 *
 * @param experience - The PlannerExperience used to populate PlannerWorkspace props (e.g., planId, title, destination, permissions, initial data, and edit token)
 * @returns A JSX element rendering PlannerWorkspace configured from `experience`
 */
export function PlanIdView({ experience }: PlanIdViewProps) {
  const router = useRouter();
  const search = useSearchParams();
  const { saveEditToken } = usePlanEditTokens({ enabled: Boolean(experience.editToken) });

  // Clean URL when accessing via slug with query params
  useEffect(() => {
    if (experience.slug && search.toString()) {
      router.replace(`/p/${experience.slug}`, { scroll: false });
    }
  }, [search, router, experience.slug]);

  // Persist edit token for future access
  useEffect(() => {
    if (experience.planId && experience.editToken) {
      saveEditToken(experience.planId, experience.editToken);
    }
  }, [experience.editToken, experience.planId, saveEditToken]);

  return (
    <PlannerWorkspace
      initialDays={experience.initialDays}
      planId={experience.planId}
      dest={experience.destination}
      title={experience.title ?? experience.destination}
      initialBudget={experience.initialBudget}
      initialEntries={experience.initialEntries}
      canEdit={experience.canEdit}
      viewerUserId={experience.viewerUserId}
      isOwner={experience.isOwner}
      isAdmin={experience.isAdmin}
      canManageMembers={experience.canManageMembers}
      editToken={experience.editToken}
    />
  );
}