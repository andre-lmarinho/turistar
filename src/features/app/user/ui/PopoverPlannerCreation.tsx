'use client';

import type { CreatePlannerPlanResult } from '@/features/app/planner/server/createPlan';
import { createUserPlan } from '@/features/app/planner/server/createPlan';
import { PopoverContent, PopoverHeader } from '@/shared/ui/popover';
import { PlannerCreationForm } from './PlannerCreationForm';

type PopoverPlannerCreationProps = {
  onPlanCreated: (plan: CreatePlannerPlanResult) => void;
  persistEditTokens?: boolean;
  lastPlan?: CreatePlannerPlanResult | null;
  onClose?: () => void;
};

export function PopoverPlannerCreation({
  onPlanCreated,
  persistEditTokens = false,
  lastPlan,
  onClose,
}: PopoverPlannerCreationProps) {
  return (
    <PopoverContent
      side="right"
      align="start"
      sideOffset={8}
      avoidCollisions
      collisionPadding={8}
      className="w-[360px] p-0"
    >
      <PopoverHeader title="Create Planner" onClose={onClose} />
      <div className="space-y-2 p-4">
        <PlannerCreationForm
          onPlanCreated={onPlanCreated}
          persistEditTokens={persistEditTokens}
          createPlanFn={createUserPlan}
        />
        {lastPlan ? (
          <p className="text-muted-foreground text-xs">
            Planner created: {lastPlan.recentPlan.dest}
          </p>
        ) : null}
      </div>
    </PopoverContent>
  );
}
