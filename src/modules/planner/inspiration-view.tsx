"use client";

import type { InspirationExperienceProps } from "@/features/inspirations/lib/getInspirationExperienceProps";
import { PlannerWorkspace } from "@/modules/planner/components/PlannerWorkspace";

interface InspirationViewProps {
  experience: InspirationExperienceProps;
}

/**
 * Render a read-only PlannerWorkspace configured from an inspiration experience.
 *
 * @param experience - The inspiration data used to initialize the workspace (e.g., `initialDays`, `planId`, `dest`, `initialBudget`, `initialEntries`).
 * @returns A React element for a PlannerWorkspace initialized from `experience` with editing and persistence disabled.
 */
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