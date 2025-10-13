'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { ActivityDialog } from '@/features/planner/components/dialog/ActivityDialog';
import { PlannerProvider, usePlannerContext } from '@/features/planner/hooks/PlannerContext';
import { usePlanTitle } from '@/features/planner/hooks/data/usePlanTitleSupabase';
import { OnboardingDialog } from '@/features/planner/modules/onboarding/components/OnboardingDialog';
import { OnboardingProvider } from '@/features/planner/modules/onboarding/hooks/OnboardingContext';
import { ModeToggleButton } from '@/features/planner/ui/button/ModeToggleButton';
import type { DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import type { Entry } from '@/features/planner/types/budget';

import { PlannerHeader } from './PlannerHeader';
import { PlannerModeDeck, type PlannerMode } from './PlannerModeDeck';

/**
 * Top-level client component for the planner experience.
 * - Shows the date-range picker, the “Open Panel” button, the filter panel,
 *   and the drag-and-drop board.
 * - Handles selecting a card to open the ActivityDialog.
 */

export interface PlannerClientProps {
  initialDays?: DayPlan[];
  planId?: string;
  slug?: string;
  dest?: string;
  title?: string;
  hideOnboarding?: boolean;
  persist?: boolean;
  initialBudget?: number;
  initialEntries?: Entry[];
}

function PlannerClientInner({
  hideOnboarding,
  persist,
  title: initialTitle,
  initialBudget,
  initialEntries,
}: {
  hideOnboarding: boolean;
  persist: boolean;
  title?: string;
  initialBudget?: number;
  initialEntries?: Entry[];
}) {
  const [mode, setMode] = useState<PlannerMode>('planner');

  const { planId, dest, currentRange, handleRangeChange } = usePlannerContext();

  const { title, setTitle, saveTitle } = usePlanTitle(planId, initialTitle ?? dest, persist);

  return (
    <OnboardingProvider planId={planId}>
      <main
        id="main-content"
        className="bg-card flex h-screen flex-col overflow-hidden p-4 md:pb-12 lg:px-12"
      >
        <PlannerHeader
          title={title}
          onTitleChange={setTitle}
          onTitleBlur={saveTitle}
          currentRange={currentRange}
          onRangeChange={handleRangeChange}
        />

        <div className="order-3 mx-auto flex w-full max-w-screen-xl items-center justify-center gap-4 py-2 md:order-2 md:justify-start md:pt-0 md:pb-4">
          <ModeToggleButton value={mode} onChange={setMode} />
        </div>

        <PlannerModeDeck
          mode={mode}
          onModeChange={setMode}
          persist={persist}
          initialBudget={initialBudget}
          initialEntries={initialEntries}
        />

        <ActivityDialog />

        {!hideOnboarding && <OnboardingDialog />}
      </main>
    </OnboardingProvider>
  );
}

export function PlannerClient({
  initialDays,
  planId,
  slug,
  dest,
  title,
  hideOnboarding = false,
  persist = true,
  initialBudget,
  initialEntries,
}: PlannerClientProps) {
  const router = useRouter();
  const search = useSearchParams();

  useEffect(() => {
    if (search.toString()) {
      router.replace(`/planner/${slug ?? planId}`, { scroll: false });
    }
  }, [search, router, slug, planId]);

  return (
    <PlannerProvider initialDays={initialDays} planId={planId ?? ''} dest={dest} persist={persist}>
      <PlannerClientInner
        hideOnboarding={hideOnboarding}
        persist={persist}
        title={title}
        initialBudget={initialBudget}
        initialEntries={initialEntries}
      />
    </PlannerProvider>
  );
}
