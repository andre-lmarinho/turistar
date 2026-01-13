"use client";

import { PlannerClient } from "@/features/app/planner/components/PlannerClient";
import type { InspirationExperienceProps } from "@/features/inspirations/lib/getInspirationExperienceProps";

interface InspirationViewProps {
  experience: InspirationExperienceProps;
}

export function InspirationView({ experience }: InspirationViewProps) {
  return (
    <PlannerClient
      initialDays={experience.initialDays}
      planId={experience.planId}
      dest={experience.dest}
      title={experience.dest}
      initialBudget={experience.initialBudget}
      initialEntries={experience.initialEntries}
      canEdit={false}
      persist={false}
    />
  );
}
