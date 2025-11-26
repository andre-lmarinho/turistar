'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { PlannerCreationForm } from '@/features/planner/components/PlannerCreationForm';
import type { CreatePlannerPlanResult } from '@/features/planner/server/createPlan';
import { createUserPlan } from '@/features/planner/server/createPlan';

export function PlannerCreationPanel() {
  const router = useRouter();
  const [lastPlan, setLastPlan] = useState<CreatePlannerPlanResult | null>(null);
  const [pendingRedirectId, setPendingRedirectId] = useState<string | null>(null);

  function handlePlanCreated(plan: CreatePlannerPlanResult) {
    setLastPlan(plan);
    setPendingRedirectId(plan.publicSlug);
  }

  useEffect(() => {
    if (!pendingRedirectId) return;

    router.push(`/planner/${pendingRedirectId}`);
    router.refresh();
    setPendingRedirectId(null);
  }, [pendingRedirectId, router]);

  return (
    <section className="border-border bg-card rounded-xl border p-6 shadow-sm">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Start a new plan</h2>
        <p className="text-muted-foreground text-sm">
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
          New plan "{lastPlan.recentPlan.dest}" ready. Redirecting…
        </div>
      ) : null}
    </section>
  );
}
