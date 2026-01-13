"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { PlannerClient } from "@/features/app/planner/components/PlannerClient";
import { usePlanEditTokens } from "@/features/app/planner/hooks/data/usePlanEditTokens";
import type { PlannerExperience } from "@/features/app/planner/server/queries/plans/getPlannerExperience";

interface PlanIdViewProps {
  experience: PlannerExperience;
}

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
    <PlannerClient
      initialDays={experience.initialDays}
      planId={experience.planId}
      slug={experience.slug}
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
