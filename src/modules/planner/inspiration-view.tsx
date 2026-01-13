"use client";

import type { InspirationExperienceProps } from "@/features/inspirations/lib/getInspirationExperienceProps";
import { PlannerWorkspace } from "@/modules/planner/components/PlannerWorkspace";

interface InspirationViewProps {
  experience: InspirationExperienceProps;
}

export function InspirationView({ experience }: InspirationViewProps) {
  return (
    <PlannerWorkspace
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
