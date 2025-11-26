'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { PlannerCreationForm } from '@/features/app/user/components/dashboard/PlannerCreationForm';
import type { CreatePlannerPlanResult } from '@/features/app/planner/server/createPlan';

export function PlannerCreationPanel() {
  const router = useRouter();
  const [lastPlan, setLastPlan] = useState<CreatePlannerPlanResult | null>(null);

  function handlePlanCreated(plan: CreatePlannerPlanResult) {
    setLastPlan(plan);
    router.push(`/p/${plan.publicSlug ?? plan.planId}`);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <PlannerCreationForm onPlanCreated={handlePlanCreated} persistEditTokens={false} />
      {lastPlan ? (
        <p className="text-muted-foreground text-xs">Planner created: {lastPlan.recentPlan.dest}</p>
      ) : null}
    </div>
  );
}
