// src/app/planner/PlannerClient.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import PlannerBoard from '@/app/planner/PlannerBoard';
import BudgetPanel from '@/app/planner/BudgetPanel';

import {
  ActivityModal,
  DestinationFilterPanel,
  DateRangePicker,
  OpenPanelButton,
  ModeToggleButton,
  LoadingScreen,
  OnboardingModal,
} from '@/components';
import { usePlanner, useActivitiesById, useSelectedActivity, usePlanTitle } from '@/hooks';
import type { CatalogActivity } from '@/types';
import { DEFAULT_COLORS, DEFAULT_NEW_CARD_COLOR_INDEX, STARTER_PLANNER_TITLE } from '@/constants';
/**
 * Top-level client component for the /planner route.
 * - Shows the date-range picker, the “Open Panel” button, the filter panel,
 *   and the drag-and-drop board.
 * - Handles selecting a card to open the ActivityModal.
 */

export default function PlannerClient() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [mode, setMode] = useState<'planner' | 'budget'>('planner');

  const {
    planId,
    dest,
    days,
    setDays,
    currentRange,
    handleRangeChange,
    isLoading,
    error,
    activeId,
    sensors,
    collisionDetection,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    addActivity,
    removeActivity,
    updateActivity,
    addBlankActivity,
  } = usePlanner(true);

  const { title, setTitle } = usePlanTitle(planId, STARTER_PLANNER_TITLE);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const seen = localStorage.getItem('planner-onboarding-shown');
    if (!seen) {
      setShowOnboarding(true);
      localStorage.setItem('planner-onboarding-shown', 'true');
    }
  }, []);

  const {
    selectedActivity,
    setSelectedActivity,
    changeDay,
    addBlankAndSelect,
    closeModal,
    save,
    deleteActivity,
    changeColor,
  } = useSelectedActivity(days, setDays, {
    addActivity,
    removeActivity,
    updateActivity,
    addBlankActivity,
  });

  // Build a Set of activity IDs already placed on the board
  const activitiesById = useActivitiesById(days);
  const addedIds = useMemo(() => new Set(Object.keys(activitiesById)), [activitiesById]);
  const activitiesTotal = useMemo(
    () =>
      days.reduce(
        (sum, day) => sum + day.activities.reduce((acc, act) => acc + (act.budget ?? 0), 0),
        0
      ),
    [days]
  );

  /* Guard clauses */
  if (!dest) return <p className="p-4">Destination missing in URL.</p>;
  if (isLoading) return <LoadingScreen text="Loading catalog…" />;
  if (error) return <p className="p-4">Failed to load.</p>;
  if (!days.length) return <p className="p-4">No catalog found.</p>;

  // dragOverlay needs a string
  const stringActiveId = activeId != null ? String(activeId) : null;

  return (
    <main id="main-content" className="flex flex-col px-4 bg-card md:px-12 md:pb-12 py-4 h-screen">
      <div className="pb-4 flex items-center justify-between">
        <h1 className="text-4xl cursor-pointer rounded-md whitespace-nowrap bg-card font-semibold capitalize hover:bg-[color-mix(in_oklch,var(--card)_75%,var(--card-foreground)_5%)]">
          <input
            id="planner-title"
            name="title"
            aria-label="Planner title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            size={Math.max(title.length, 1)}
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.select()}
            className="px-4 py-2 border-2 rounded-md bg-transparent border-transparent outline-none transition-colors focus:border-border focus:bg-background cursor-pointer focus:cursor-text"
          />
        </h1>
        <OpenPanelButton days={days} onClick={() => setIsPanelOpen(true)} />
      </div>
      <div className="pb-4 flex items-center justify-between gap-4">
        <div>
          <ModeToggleButton value={mode} onChange={setMode} />
        </div>
        <DateRangePicker value={currentRange} onChange={handleRangeChange} />
      </div>
      <DestinationFilterPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onAdd={(item: CatalogActivity) =>
          addActivity({
            id: item.id,
            title: item.name,
            description: item.description,
            duration: item.duration,
            imageUrl: item.image_url,
            color: DEFAULT_COLORS[DEFAULT_NEW_CARD_COLOR_INDEX],
            startTime: '',
          })
        }
        onRemove={removeActivity}
        addedIds={addedIds}
      />
      <AnimatePresence mode="wait">
        {mode === 'budget' ? (
          <motion.div
            key="budget"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1"
          >
            <BudgetPanel
              planId={planId}
              activitiesTotal={activitiesTotal}
              days={days}
              onUpdateBudget={(id, amount) => updateActivity(id, { budget: amount })}
            />
          </motion.div>
        ) : (
          <motion.div
            key="planner"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1"
          >
            <PlannerBoard
              days={days}
              activeId={stringActiveId}
              sensors={sensors}
              collisionDetection={collisionDetection}
              handleDragStart={handleDragStart}
              handleDragOver={handleDragOver}
              handleDragEnd={handleDragEnd}
              onSelectActivity={setSelectedActivity}
              onUpdateTitle={(id, title) => updateActivity(id, { title })}
              onAddActivity={(dayId, insertIdx) => addBlankAndSelect(dayId, insertIdx)}
              onChangeDay={changeDay}
              onChangeColor={(id, color) => changeColor(id, color)}
              onDelete={removeActivity}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {selectedActivity && (
        <ActivityModal
          open
          activity={selectedActivity}
          onClose={closeModal}
          onSave={save}
          onDelete={deleteActivity}
          color={selectedActivity.color}
          onColorChange={(newColor) => changeColor(selectedActivity.id, newColor)}
          days={days}
          onChangeDay={(dayId) => changeDay(selectedActivity.id, dayId)}
        />
      )}
      <OnboardingModal open={showOnboarding} onClose={() => setShowOnboarding(false)} />
    </main>
  );
}
