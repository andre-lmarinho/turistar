// src/app/planner/PlannerClient.tsx
'use client';

import React, { useState, useMemo } from 'react';

import PlannerBoard from '@/app/planner/PlannerBoard';
import PlannerBoardVertical from '@/app/planner/PlannerBoardVertical';
import BudgetPanel from '@/app/planner/BudgetPanel';

import {
  ActivityModal,
  DestinationFilterPanel,
  DateRangePicker,
  OpenPanelButton,
  ViewToggleButton,
} from '@/components';
import { usePlanner, usePlannerBoard } from '@/hooks';
import type { Activity, CatalogActivity } from '@/types';
import { DEFAULT_COLORS, DEFAULT_NEW_CARD_COLOR_INDEX } from '@/constants';
import { buildInitialDays } from '@/utils';

/**
 * Top-level client component for the /planner route.
 * - Shows the date-range picker, the “Open Panel” button, the filter panel,
 *   and the drag-and-drop board.
 * - Handles selecting a card to open the ActivityModal.
 */
interface PlannerClientProps {
  orientation?: 'horizontal' | 'vertical';
  onToggleView: () => void;
}

export default function PlannerClient({
  orientation = 'horizontal',
  onToggleView,
}: PlannerClientProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [showBudget, setShowBudget] = useState(false);

  // Fetch URL + range + tripDays + base state
  const { dest, tripDays, currentRange, handleRangeChange, isLoading, error } = usePlanner(true);

  // Board state and DnD helpers (syncs with tripDays)
  const {
    days,
    activeId,
    sensors,
    collisionDetection,
    handleDragStart,
    handleDragOver,
    addActivity,
    removeActivity,
    updateActivity,
    addBlankActivity,
  } = usePlannerBoard(buildInitialDays(tripDays));

  // Build a Set of activity IDs already placed on the board
  const addedIds = useMemo(
    () => new Set(days.flatMap((d) => d.activities.map((a) => a.id))),
    [days]
  );

  const BoardComponent = orientation === 'vertical' ? PlannerBoardVertical : PlannerBoard;

  const [selectedActivity, setSelectedActivity] = useState<(Activity & { dayId?: string }) | null>(
    null
  );

  /* Guard clauses */
  if (!dest) return <p className="p-4">Destination missing in URL.</p>;
  if (isLoading) return <p className="p-4">Loading itinerary…</p>;
  if (error) return <p className="p-4">Failed to load.</p>;
  if (!days.length) return <p className="p-4">No itinerary found.</p>;

  return (
    <>
      {/* Date picker, catalog and view toggle */}

      <div>
        <OpenPanelButton onClick={() => setIsPanelOpen(true)} />
      </div>
      <div className="mb-4 flex items-center space-x-2">
        <DateRangePicker value={currentRange} onChange={handleRangeChange} />
        <button
          onClick={() => setShowBudget((b) => !b)}
          className="px-3 py-2 border rounded text-sm"
        >
          {showBudget ? 'Planner' : 'Budget'}
        </button>

        <ViewToggleButton orientation={orientation} onToggle={onToggleView} />
      </div>

      {/* Popup filter panel */}
      {showBudget ? (
        <BudgetPanel />
      ) : (
        <>
          {/* Popup filter panel */}
          <DestinationFilterPanel
            isOpen={isPanelOpen}
            onClose={() => setIsPanelOpen(false)}
            // When adding from catalog, transform CatalogActivity to Activity
            onAdd={(catalogItem: CatalogActivity) => {
              addActivity({
                id: catalogItem.id,
                title: catalogItem.name,
                description: catalogItem.description,
                duration: catalogItem.duration,
                imageUrl: catalogItem.image_url,
                color: DEFAULT_COLORS[DEFAULT_NEW_CARD_COLOR_INDEX],
                startTime: '', // default when adding from catalog
              });
            }}
            onRemove={removeActivity}
            addedIds={addedIds}
          />

          {/* Drag-and-Drop board with click-to-edit */}
          <BoardComponent
            days={days}
            activeId={activeId}
            sensors={sensors}
            collisionDetection={collisionDetection}
            handleDragStart={handleDragStart}
            handleDragOver={handleDragOver}
            onSelectActivity={setSelectedActivity}
            onUpdateTitle={(id, newTitle) => {
              updateActivity(id, { title: newTitle });
            }}
            onAddNew={(dayId, insertIdx) => {
              const idx = days.findIndex((d) => d.id === dayId);
              const blank = addBlankActivity(idx, insertIdx);
              setSelectedActivity({ ...blank, dayId });
            }}
          />
        </>
      )}

      {/* Activity editing modal */}
      {!showBudget && selectedActivity && (
        <ActivityModal
          open={true}
          activity={selectedActivity}
          // Discard temporary cards when closing without a title
          onClose={() => {
            if (selectedActivity.id.startsWith('blank-') && !selectedActivity.title.trim()) {
              removeActivity(selectedActivity.id);
            }
            setSelectedActivity(null);
          }}
          onSave={(patch) => {
            if (!patch.title || !patch.title.trim()) return;
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
          color={selectedActivity.color ?? ''}
          onColorChange={(newColor) => {
            setSelectedActivity({ ...selectedActivity, color: newColor });
            if (selectedActivity.title.trim() && !selectedActivity.id.startsWith('temp-')) {
              updateActivity(selectedActivity.id, { color: newColor });
            }
          }}
        />
      )}
    </>
  );
}
