'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { ActivityDialog } from '@/features/app/planner/components/dialog/ActivityDialog';
import { PlannerProvider, usePlannerContext } from '@/features/app/planner/hooks/PlannerContext';
import { usePlanTitle } from '@/features/app/planner/hooks/data/usePlanTitleSupabase';
import type { DayPlan } from '@/features/app/planner/domain/types/PlannerEntities';
import type { Entry } from '@/features/app/planner/types/budget';
import { usePlanEditTokens } from '@/features/app/planner/infrastructure/supabase/planEditToken';

import { PlannerHeader } from './PlannerHeader';
import { PlannerModeDeck, type PlannerMode } from './PlannerModeDeck';
import { ModeToggleButton } from '@/features/app/planner/components/ui/ModeToggleButton';

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
  persist?: boolean;
  canEdit?: boolean;
  editToken?: string;
  initialBudget?: number;
  initialEntries?: Entry[];
}

function PlannerClientInner({
  persist,
  title: initialTitle,
  canEdit,
  editToken,
  initialBudget,
  initialEntries,
}: {
  persist: boolean;
  title?: string;
  canEdit: boolean;
  editToken?: string;
  initialBudget?: number;
  initialEntries?: Entry[];
}) {
  const [mode, setMode] = useState<PlannerMode>('planner');

  const { planId, dest, currentRange, handleRangeChange } = usePlannerContext();

  const { title, setTitle, saveTitle } = usePlanTitle(planId, initialTitle ?? dest, persist, {
    canEdit,
    editToken,
  });

  return (
    <main className="bg-card relative flex h-screen flex-col overflow-hidden p-4 md:pb-12 lg:px-12">
      <PlannerHeader
        title={title}
        onTitleChange={setTitle}
        onTitleBlur={saveTitle}
        currentRange={currentRange}
        onRangeChange={handleRangeChange}
        mode={mode}
        onModeChange={setMode}
        canEdit={canEdit}
      />

      <PlannerModeDeck
        mode={mode}
        onModeChange={setMode}
        persist={persist}
        canEdit={canEdit}
        initialBudget={initialBudget}
        initialEntries={initialEntries}
      />

      <ActivityDialog />

      <div className="flex flex-none items-center gap-2 self-center p-6 md:hidden">
        <ModeToggleButton value={mode} onChange={setMode} />
      </div>
    </main>
  );
}

export function PlannerClient({
  initialDays,
  planId,
  slug,
  dest,
  title,
  persist = true,
  canEdit = true,
  editToken,
  initialBudget,
  initialEntries,
}: PlannerClientProps) {
  const router = useRouter();
  const search = useSearchParams();
  const { saveEditToken } = usePlanEditTokens({ enabled: Boolean(editToken) });

  useEffect(() => {
    if (!slug) {
      return;
    }

    if (search.toString()) {
      router.replace(`/p/${slug}`, { scroll: false });
    }
  }, [search, router, slug]);

  useEffect(() => {
    if (!planId || !editToken) {
      return;
    }

    saveEditToken(planId, editToken);
  }, [editToken, planId, saveEditToken]);

  const persistState = persist;

  return (
    <PlannerProvider
      initialDays={initialDays}
      planId={planId ?? ''}
      dest={dest}
      persist={persistState}
      canEdit={canEdit}
    >
      <PlannerClientInner
        persist={persistState}
        title={title}
        canEdit={canEdit}
        editToken={editToken}
        initialBudget={initialBudget}
        initialEntries={initialEntries}
      />
    </PlannerProvider>
  );
}
