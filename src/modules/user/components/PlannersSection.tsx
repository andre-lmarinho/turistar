"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { PlannerCreationForm } from "@/features/plan/components/PlannerCreationForm";
import type { CreatePlannerPlanResult } from "@/features/plan/lib/createUserPlan";
import type { UserPlannerSummary } from "@/features/plan/lib/getUserPlanners";
import { DEFAULT_PLAN_COVER_IMAGE } from "@/features/search/config";
import { Card, CardGrid } from "@/shared/ui/card";
import { Kanban } from "@/shared/ui/icon";
import { Popover, PopoverContent, PopoverTriggerButton } from "@/shared/ui/popover";

interface PlannersSectionProps {
  plans: UserPlannerSummary[];
}

function NewPlannerTile() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handlePlanCreated(plan: CreatePlannerPlanResult) {
    setOpen(false);
    router.push(`/p/${plan.publicSlug ?? plan.planId}`);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTriggerButton className="bg-muted border-border block h-full w-full cursor-pointer rounded-xl border shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex h-40 w-full flex-col items-center justify-center px-4 text-center">
          <p className="truncate text-sm font-semibold">Create new planner</p>
        </div>
      </PopoverTriggerButton>
      <PopoverContent title="Create Planner" side="right" align="start" sideOffset={8} className="w-90 p-0">
        <div className="p-4">
          <PlannerCreationForm onPlanCreated={handlePlanCreated} />
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function PlannersSection({ plans }: PlannersSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Kanban className="text-primary h-5 w-5" aria-hidden="true" />
        <h2 className="text-foreground text-base font-semibold">Your planners</h2>
      </div>

      <CardGrid>
        {plans.map((plan) => (
          <Card
            key={plan.id}
            href={`/p/${plan.publicSlug}`}
            title={plan.title}
            image={plan.coverImage ?? DEFAULT_PLAN_COVER_IMAGE}
          />
        ))}
        <NewPlannerTile />
      </CardGrid>
    </section>
  );
}
