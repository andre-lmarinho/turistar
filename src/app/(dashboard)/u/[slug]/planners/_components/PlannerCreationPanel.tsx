'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { PlannerCreationForm } from '@/features/planner/components/PlannerCreationForm';
import type { CreatePlannerPlanResult } from '@/features/planner/server/createPlan';
import { createUserPlan } from '@/features/planner/server/createPlan';

export function PlannerCreationPanel({ ownerSlug }: { ownerSlug: string }) {
  const router = useRouter();
  const [lastPlan, setLastPlan] = useState<CreatePlannerPlanResult | null>(null);

  function handlePlanCreated(plan: CreatePlannerPlanResult) {
    setLastPlan(plan);
    router.refresh();
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Start a new plan</h2>
        <p className="text-sm text-muted-foreground">
          Launch a fresh itinerary and keep building without leaving the dashboard.
        </p>
      </div>
      <PlannerCreationForm
        onPlanCreated={handlePlanCreated}
        createPlanFn={createUserPlan}
        persistEditTokens={false}
      />
      {lastPlan ? (
        <div className="bg-muted text-muted-foreground mt-4 rounded-md px-3 py-2 text-sm">
          New plan "{lastPlan.recentPlan.dest}" ready.
          <button
            type="button"
            className="text-primary ml-2 font-medium hover:underline"
            onClick={() => router.push(`/u/${ownerSlug}/planners/${lastPlan.planId}`)}
          >
            Open now
          </button>
        </div>
      ) : null}
    </section>
  );
}
