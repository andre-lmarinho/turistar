// src/app/planner/PlannerClient.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

import PlannerBoard from '@/app/planner/PlannerBoard';
import BudgetPanel from '@/app/planner/BudgetPanel';

import {
  ActivityModal,
  DestinationFilterPanel,
  DateRangePicker,
  OpenPanelButton,
  ModeToggleButton,
} from '@/components';
import { usePlanner, useActivitiesById } from '@/hooks';
import type { Activity, CatalogActivity } from '@/types';
import { moveActivityToDay } from '@/utils';
import { DEFAULT_COLORS, DEFAULT_NEW_CARD_COLOR_INDEX } from '@/constants';

/**
 * Top-level client component for the /planner route.
 * - Shows the date-range picker, the “Open Panel” button, the filter panel,
 *   and the drag-and-drop board.
 * - Handles selecting a card to open the ActivityModal.
 */

export default function PlannerClient() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [mode, setMode] = useState<'planner' | 'budget'>('planner');
  const [selectedActivity, setSelectedActivity] = useState<(Activity & { dayId?: string }) | null>(
    null
  );

  const {
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

  function handleChangeDay(activityId: string, dayId: string) {
    setDays((prev) => moveActivityToDay(prev, activityId, dayId));
    setSelectedActivity((prev) => (prev ? { ...prev, dayId } : prev));
  }

  // Build a Set of activity IDs already placed on the board
  const activitiesById = useActivitiesById(days);
  const addedIds = useMemo(() => new Set(Object.keys(activitiesById)), [activitiesById]);
  const searchParams = useSearchParams();
  const destination = searchParams.get('dest') || 'Catalog';

  /* Guard clauses */
  if (!dest) return <p className="p-4">Destination missing in URL.</p>;
  if (isLoading) return <p className="p-4">Loading catalog…</p>;
  if (error) return <p className="p-4">Failed to load.</p>;
  if (!days.length) return <p className="p-4">No catalog found.</p>;

  // dragOverlay needs a string
  const stringActiveId = activeId != null ? String(activeId) : null;

  return (
    <main className="flex flex-col px-4 md:px-12 py-4 bg-card h-screen">
      <div className="pb-4 flex justify-between">
        <h1 className="text-5xl font-semibold capitalize">{destination}</h1>
        <OpenPanelButton onClick={() => setIsPanelOpen(true)} />
      </div>
      <div className="pb-4 flex justify-between gap-4">
        <div>
          <ModeToggleButton value={mode} onChange={setMode} />
        </div>
        <DateRangePicker value={currentRange} onChange={handleRangeChange} />
      </div>

      {mode === 'budget' ? (
        <BudgetPanel />
      ) : (
        <>
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
            onAddActivity={(dayId, insertIdx) => {
              const dayIndex = days.findIndex((d) => d.id === dayId);
              const blank = addBlankActivity(dayIndex, insertIdx);
              setSelectedActivity({ ...blank, dayId });
            }}
            onChangeDay={handleChangeDay}
            onChangeColor={(id, color) => {
              setSelectedActivity((prev) => prev && { ...prev, color });
              updateActivity(id, { color });
            }}
          />
        </>
      )}

      {selectedActivity && (
        <ActivityModal
          open
          activity={selectedActivity}
          onClose={() => {
            if (selectedActivity.id.startsWith('blank-') && !selectedActivity.title.trim()) {
              removeActivity(selectedActivity.id);
            }
            setSelectedActivity(null);
          }}
          onSave={(patch) => {
            if (!patch.title?.trim()) return;
            if (selectedActivity.id.startsWith('temp-')) {
              addActivity(
                {
                  ...selectedActivity,
                  ...patch,
                  duration: Number(patch.duration),
                },
                days.findIndex((d) => d.id === selectedActivity.dayId)
              );
            } else {
              updateActivity(selectedActivity.id, {
                ...patch,
                duration: Number(patch.duration),
              });
            }
            setSelectedActivity(null);
          }}
          onDelete={() => {
            removeActivity(selectedActivity.id);
            setSelectedActivity(null);
          }}
          color={selectedActivity.color}
          onColorChange={(newColor) => {
            setSelectedActivity({ ...selectedActivity, color: newColor });
            if (selectedActivity.title.trim() && !selectedActivity.id.startsWith('temp-')) {
              updateActivity(selectedActivity.id, { color: newColor });
            }
          }}
          days={days}
          onChangeDay={(dayId) => handleChangeDay(selectedActivity.id, dayId)}
        />
      )}
    </main>
  );
}
