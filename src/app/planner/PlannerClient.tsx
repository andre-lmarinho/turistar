// src/app/planner/PlannerClient.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import PlannerBoard from '@/app/planner/PlannerBoard';
import BudgetPanel from '@/app/planner/BudgetPanel';
const MapView = dynamic(() => import('@/app/planner/MapView'), { ssr: false });

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
import { motion } from 'framer-motion';

/**
 * Top-level client component for the /planner route.
 * - Shows the date-range picker, the “Open Panel” button, the filter panel,
 *   and the drag-and-drop board.
 * - Handles selecting a card to open the ActivityModal.
 */

type Mode = 'planner' | 'map' | 'budget';
const modeOrder: Mode[] = ['planner', 'map', 'budget'];

export default function PlannerClient() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('planner');

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
    const key = `planner-onboarding-shown-${planId}`;
    if (!localStorage.getItem(key)) {
      setShowOnboarding(true);
      localStorage.setItem(key, 'true');
    }
  }, [planId]);

  const {
    selectedActivity,
    setSelectedActivity,
    changeDay,
    changePosition,
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

  const stringActiveId = activeId != null ? String(activeId) : null;
  const activeIdx = modeOrder.indexOf(mode);

  return (
    <main
      id="main-content"
      className="flex flex-col bg-card p-4 lg:px-12 md:pb-12 h-screen overflow-hidden"
    >
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
        <ModeToggleButton value={mode} onChange={setMode} />
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
            latitude: item.latitude,
            longitude: item.longitude,
            color: DEFAULT_COLORS[DEFAULT_NEW_CARD_COLOR_INDEX],
            startTime: '',
          })
        }
        onRemove={removeActivity}
        addedIds={addedIds}
      />

      <div className="relative flex-1 overflow-visible">
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
              style={{
                zIndex: z,
              }}
              initial={false}
              animate={{
                x: `${offset}%`,
                scale: scale,
                opacity: opacity,
                rotateZ: rotate,
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              onClick={() => !isActive && setMode(m)}
            >
              <div style={{ pointerEvents: isActive ? 'auto' : 'none' }} className="h-full">
                {m === 'planner' && (
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
                    onChangePosition={changePosition}
                    onChangeColor={(id, color) => changeColor(id, color)}
                    onDelete={removeActivity}
                  />
                )}
                {m === 'budget' && (
                  <BudgetPanel
                    planId={planId}
                    activitiesTotal={activitiesTotal}
                    days={days}
                    onUpdateBudget={(id, amount) => updateActivity(id, { budget: amount })}
                  />
                )}
                {m === 'map' && <MapView days={days} onSelectActivity={setSelectedActivity} />}
              </div>
            </motion.div>
          );
        })}
      </div>

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
          onChangePosition={(idx) => changePosition(selectedActivity.id, idx)}
        />
      )}

      <OnboardingModal open={showOnboarding} onClose={() => setShowOnboarding(false)} />
    </main>
  );
}
