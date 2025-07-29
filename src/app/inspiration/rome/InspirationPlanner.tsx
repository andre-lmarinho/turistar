// src/app/inspiration/rome/InspirationPlanner.tsx
'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { closestCenter } from '@dnd-kit/core';

import PlannerBoard from '@/app/planner/PlannerBoard';
import BudgetPanel from '@/app/planner/BudgetPanel';
const MapView = dynamic(() => import('@/app/planner/MapView'), { ssr: false });

import { ActivityModal, PlannerControls } from '@/components';
import { useDnDPlanner, useSelectedActivity, usePlanTitle, useKeyBinds } from '@/hooks';
import type { DayPlan, CatalogActivity } from '@/types';
import { motion } from 'framer-motion';

/**
 * Interactive planner preloaded with sample days.
 * Used by the Rome inspiration page.
 */

type Mode = 'planner' | 'map' | 'budget';
const modeOrder: Mode[] = ['planner', 'map', 'budget'];

interface Props {
  initialDays: DayPlan[];
  dest: string;
  planId: string;
}

export default function InspirationPlanner({ initialDays, dest, planId }: Props) {
  const [mode, setMode] = useState<Mode>('planner');

  const {
    days,
    setDays,
    activeId,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    addActivity,
    removeActivity,
    updateActivity,
    addBlankActivity,
  } = useDnDPlanner(initialDays);

  const { title, setTitle } = usePlanTitle(planId, dest);

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
    onCatalog: () => {},
  });

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
      </div>

      <PlannerControls
        mode={mode}
        onModeChange={setMode}
        range={undefined}
        onRangeChange={() => {}}
      />

      {/* BOARD / MAP / BUDGET */}
      <div className="relative order-2 container flex-1 overflow-visible md:order-3">
        {modeOrder.map((m, idx) => {
          const isActive = idx === activeIdx;
          const rel = idx - activeIdx;
          const abs = Math.abs(rel);
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
                    collisionDetection={closestCenter}
                    handleDragStart={handleDragStart}
                    handleDragOver={handleDragOver}
                    handleDragEnd={handleDragEnd}
                    onSelectActivity={setSelectedActivity}
                    onUpdateTitle={(id, title) => updateActivity(id, { title })}
                    onAddActivity={(dayId, insertIdx) => addBlankAndSelect(dayId, insertIdx)}
                    onChangeDay={changeDay}
                    onChangePosition={changePosition}
                    onChangeColor={(id, color) => changeColor(id, color)}
                    onUpdateImage={(id, url) => updateActivity(id, { imageUrl: url })}
                    onApplyCatalogItem={(id, item: CatalogActivity) =>
                      updateActivity(id, { imageUrl: item.imageUrl || '' })
                    }
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
    </main>
  );
}
