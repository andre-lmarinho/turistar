'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import type { CreatePlannerPlanResult } from '@/features/app/planner/server/createPlan';
import { PopoverPlannerCreation } from '@/features/app/user/ui/PopoverPlannerCreation';
import { Popover, PopoverTriggerButton } from '@/shared/ui/popover';

export function NewPlannerTile() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [lastPlan, setLastPlan] = useState<CreatePlannerPlanResult | null>(null);

  async function handlePlanCreated(plan: CreatePlannerPlanResult) {
    setLastPlan(plan);
    setOpen(false);
    await router.push(`/p/${plan.publicSlug ?? plan.planId}`);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTriggerButton className="bg-muted border-border block h-full w-full cursor-pointer rounded-xl border shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex h-40 w-full flex-col items-center justify-center px-4 text-center">
          <p className="truncate text-sm font-semibold">Create new planner</p>
        </div>
      </PopoverTriggerButton>
      <PopoverPlannerCreation
        onPlanCreated={handlePlanCreated}
        persistEditTokens={false}
        lastPlan={lastPlan}
        onClose={() => setOpen(false)}
      />
    </Popover>
  );
}
