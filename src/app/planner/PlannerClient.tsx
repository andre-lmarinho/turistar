// src/app/planner/PlannerClient.tsx
'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import PlannerBoard from '@/app/planner/PlannerBoard';
import BudgetPanel from '@/app/planner/BudgetPanel';
const MapView = dynamic(() => import('@/app/planner/MapView'), { ssr: false });

import {
  ActivityModal,
  DestinationFilterPanel,
  DateRangePickerIcon,
  OpenPanelButton,
  OpenPanelIcon,
  OnboardingModal,
  PlannerControls,
} from '@/components';
import {
  usePlanner,
  useActivitiesById,
  useSelectedActivity,
  usePlanTitle,
  useKeyBinds,
  useOnboardingCheck,
} from '@/hooks';
import type { CatalogActivity, DayPlan } from '@/types';
import { DEFAULT_COLORS, DEFAULT_NEW_CARD_COLOR_INDEX } from '@/constants';
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
  dest?: string;
  hideOnboarding?: boolean;
  hideCatalog?: boolean;
}

interface PlannerClientProps {
  initialDays?: DayPlan[];
  planId?: string;
  dest?: string;
  hideOnboarding?: boolean;
  hideCatalog?: boolean;
}

export default function PlannerClient({
  initialDays,
  planId: planIdProp,
  dest: destProp,
  hideOnboarding = false,
  hideCatalog = false,
}: PlannerClientProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('planner');

  const {
    planId,
    dest,
    days,
    setDays,
    currentRange,
    handleRangeChange,
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
  } = usePlanner({ initialDays, planId: planIdProp, dest: destProp });

  const { title, setTitle } = usePlanTitle(planId, dest);
  const onboarding = useOnboardingCheck(planId);
  const showOnboarding = hideOnboarding ? false : onboarding.showOnboarding;
  const setShowOnboarding = hideOnboarding ? () => {} : onboarding.setShowOnboarding;

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

  const handleUpdateImage = (id: string, url: string) => {
    updateActivity(id, { imageUrl: url });
    setSelectedActivity((prev) => (prev && prev.id === id ? { ...prev, imageUrl: url } : prev));
  };

  const handleApplyCatalogItem = (id: string, item: CatalogActivity) => {
    handleUpdateImage(id, item.imageUrl || '');
  };

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

  useKeyBinds({
    onPlanner: () => setMode('planner'),
    onMap: () => setMode('map'),
    onBudget: () => setMode('budget'),
    onNewCard: () => addBlankAndSelect(days[0].id),
    onCatalog: hideCatalog ? () => {} : () => setIsPanelOpen(true),
  });

  /* Guard clauses */
  if (!dest) return <p className="p-4">Destination missing in URL.</p>;
  if (!days.length) return <p className="p-4">No catalog found.</p>;

  const stringActiveId = activeId != null ? String(activeId) : null;
  const activeIdx = modeOrder.indexOf(mode);

  return (
    <main
      id="main-content"
      className="bg-card flex h-screen flex-col overflow-hidden p-4 md:pb-12 lg:px-12"
    >
      {/* HEADER */}
      <div className="container flex items-center justify-between gap-4 pb-4">
        <h1 className="bg-card inline-flex flex-none cursor-pointer rounded-md text-3xl font-semibold whitespace-nowrap capitalize hover:bg-[color-mix(in_oklch,var(--card)_75%,var(--card-foreground)_5%)] md:text-5xl">
          <input
            id="planner-title"
            name="title"
            role="heading"
            aria-level={1}
            aria-label="Planner title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: `${Math.max(title.length, 1)}ch` }}
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.select()}
            className="focus:border-border focus:bg-background cursor-pointer rounded-md border-2 border-transparent bg-transparent px-4 py-2 transition-colors outline-none focus:cursor-text"
          />
        </h1>
        {!hideCatalog && (
          <>
            <div className="flex gap-2 md:hidden">
              <DateRangePickerIcon value={currentRange} onChange={handleRangeChange} />
              <OpenPanelIcon onClick={() => setIsPanelOpen(true)} />
            </div>
            <div className="hidden md:flex">
              <OpenPanelButton days={days} onClick={() => setIsPanelOpen(true)} />
            </div>
          </>
        )}
      </div>

      <PlannerControls
        mode={mode}
        onModeChange={setMode}
        range={currentRange}
        onRangeChange={handleRangeChange}
      />

      {/* BOARD / MAP / BUDGET */}
      <div className="relative order-2 container flex-1 overflow-visible md:order-3">
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
                {m === 'planner' && (
                  <PlannerBoard
                    days={days}
                    dest={dest}
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
                    onUpdateImage={handleUpdateImage}
                    onApplyCatalogItem={handleApplyCatalogItem}
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
          dest={dest}
          onChangeDay={(dayId) => changeDay(selectedActivity.id, dayId)}
          onChangePosition={(idx) => changePosition(selectedActivity.id, idx)}
        />
      )}

      {!hideOnboarding && (
        <OnboardingModal open={showOnboarding} onClose={() => setShowOnboarding(false)} />
      )}
      {!hideCatalog && (
        <DestinationFilterPanel
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
          dest={dest}
          onAdd={(item: CatalogActivity) =>
            addActivity({
              id: item.id,
              title: item.name,
              imageUrl: item.imageUrl,
              address: item.address,
              latitude: item.latitude,
              longitude: item.longitude,
              color: DEFAULT_COLORS[DEFAULT_NEW_CARD_COLOR_INDEX].bg,
              startTime: '',
            })
          }
          onRemove={removeActivity}
          addedIds={addedIds}
        />
      )}
    </main>
  );
}
