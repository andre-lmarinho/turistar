// src/app/planner/PlannerClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import PlannerBoard from '@/app/planner/PlannerBoard';
import BudgetPanel from '@/app/planner/BudgetPanel';
const MapView = dynamic(() => import('@/app/planner/MapView'), { ssr: false });

import ActivityModal from '@/features/planner/components/modal/ActivityModal';
import PlannerControls from '@/features/planner/components/PlannerControls';
import { PlannerProvider, usePlannerContext } from '@/features/planner/hooks/PlannerContext';
import { usePlanTitle } from '@/features/planner/hooks/usePlanTitleSupabase';
import OnboardingModal from '@/features/onboarding/components/OnboardingModal';
import { OnboardingProvider } from '@/features/onboarding/hooks/OnboardingContext';
import { DateRangePickerIcon } from '@/shared/ui/DatePicker';
import { useElementMeasure } from '@/shared/hooks/ui/useElementMeasure';
import { useKeyBinds } from '@/shared/hooks/ui/useKeyBinds';
import type { DayPlan } from '@/shared/types';
import type { Entry } from '@/features/planner/types/budget/budget';
import { motion } from 'framer-motion';

/**
 * Top-level client component for the /planner route.
 * - Shows the date-range picker, the “Open Panel” button, the filter panel,
 *   and the drag-and-drop board.
 * - Handles selecting a card to open the ActivityModal.
 */

type Mode = 'planner' | 'map' | 'budget';
const modeOrder: Mode[] = ['planner', 'map', 'budget'];

interface PlannerClientProps {
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
  const [mode, setMode] = useState<Mode>('planner');

  const { planId, dest, days, currentRange, handleRangeChange, addBlankAndSelect } =
    usePlannerContext();

  const { title, setTitle, saveTitle } = usePlanTitle(planId, initialTitle ?? dest, persist);
  const { ref: titleRef, width: titleWidth } = useElementMeasure<HTMLInputElement>({
    width: true,
    text: title,
  });

  useKeyBinds({
    onPlanner: () => setMode('planner'),
    onMap: () => setMode('map'),
    onBudget: () => setMode('budget'),
    onNewCard: () => {
      if (days[0]) addBlankAndSelect(days[0].id);
    },
  });

  const activeIdx = modeOrder.indexOf(mode);

  return (
    <OnboardingProvider planId={planId}>
      <main
        id="main-content"
        className="bg-card flex h-screen flex-col overflow-hidden p-4 md:pb-12 lg:px-12"
      >
        {/* HEADER */}
        <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between gap-4 pb-4">
          <h1 className="bg-card inline-flex flex-none cursor-pointer rounded-md text-3xl font-semibold whitespace-nowrap capitalize hover:bg-[color-mix(in_oklch,var(--card)_75%,var(--card-foreground)_5%)] md:text-5xl">
            <input
              id="planner-title"
              name="title"
              role="heading"
              aria-level={1}
              aria-label="Planner title"
              type="text"
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={saveTitle}
              style={{ width: `${titleWidth}px` }}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.select()}
              className="focus:border-border focus:bg-background cursor-pointer rounded-md border-2 border-transparent bg-transparent px-4 py-2 transition-colors outline-none focus:cursor-text"
            />
          </h1>
          <div className="flex gap-2 md:hidden">
            <DateRangePickerIcon value={currentRange} onChange={handleRangeChange} />
          </div>
        </div>

        <PlannerControls mode={mode} onModeChange={setMode} />

        {/* BOARD / MAP / BUDGET */}
        <div className="relative order-2 mx-auto w-full max-w-screen-xl flex-1 overflow-visible md:order-3">
          {modeOrder.map((m, idx) => {
            const isActive = idx === activeIdx;
            const rel = idx - activeIdx;
            const abs = Math.abs(idx - activeIdx);
            const z = 3 - abs;
            const offsetMap = [0, 6, 10];
            const offset = offsetMap[abs] * Math.sign(rel);
            const scaleMap = [1, 0.92, 0.87];
            const scale = scaleMap[abs] ?? 0.7;
            const opacityMap = [1, 0.92, 0.8];
            const opacity = opacityMap[abs] ?? 0.6;
            const rotate = rel * 2;

            return (
              <motion.div
                key={m}
                className={`absolute inset-0 ${!isActive ? 'cursor-pointer' : ''}`}
                style={{ zIndex: z }}
                initial={false}
                animate={{ x: `${offset}%`, scale, opacity, rotateZ: rotate }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                onClick={() => !isActive && setMode(m)}
              >
                <div style={{ pointerEvents: isActive ? 'auto' : 'none' }} className="h-full">
                  {m === 'planner' && <PlannerBoard />}
                  {m === 'budget' && (
                    <BudgetPanel
                      initialBudget={initialBudget}
                      initialEntries={initialEntries}
                      persist={persist}
                    />
                  )}
                  {m === 'map' && <MapView />}
                </div>
              </motion.div>
            );
          })}
        </div>

        <ActivityModal />

        {!hideOnboarding && <OnboardingModal />}
      </main>
    </OnboardingProvider>
  );
}

export default function PlannerClient({
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
