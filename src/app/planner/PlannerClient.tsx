// src/app/planner/PlannerClient.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { DateRangePicker } from '@/components/ui/DatePicker';
import OpenPanelButton from '@/components/ui/BtnOpenCatalog';
import PlannerBoard from '@/app/planner/PlannerBoard';
import DestinationFilterPanel from '@/components/planner/catalog/DestinationFilterPanel';
import ActivityModal from '@/components/planner/modal/ActivityModal';
import { usePlanner } from '@/hooks/usePlanner';
import type { Activity } from '@/types/itinerary';
import { DEFAULT_COLORS, DEFAULT_NEW_CARD_COLOR_INDEX } from '@/constants/colors';

// TODO: replace with real list from your data source
import salvador from '@/data/salvador.json';

/**
 * Top-level client component for the /planner route.
 * - Shows the date-range picker, the “Open Panel” button, the filter panel,
 *   and the drag-and-drop board.
 * - Handles selecting a card to open the ActivityModal.
 */
export default function PlannerClient() {
  const {
    dest,
    days,
    currentRange,
    handleRangeChange,
    isLoading,
    error,
    sensors,
    collisionDetection,
    handleDragStart,
    handleDragOver,
    activeId,
    addActivity,
    removeActivity,
    updateActivity,
  } = usePlanner();

  /* Build a Set of activity IDs already placed on the board */
  const addedIds = useMemo(
    () => new Set(days.flatMap((d) => d.activities.map((a) => a.id))),
    [days]
  );

  /* Build list of POI names for autocomplete */
  const poiOptions = useMemo(() => salvador.activities.map((a) => a.name), []);

  /* Filter-panel visibility */
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  /* Selected activity for editing in the modal */
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
      {/* Date picker + “Open Panel” button */}
      <div className="mb-4 max-w-sm flex items-center space-x-2">
        <DateRangePicker value={currentRange} onChange={handleRangeChange} />
        <OpenPanelButton onClick={() => setIsPanelOpen(true)} />
      </div>

      {/* Popup filter panel */}
      <DestinationFilterPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onAdd={addActivity}
        onRemove={removeActivity}
        addedIds={addedIds}
      />

      {/* Drag-and-Drop board with click-to-edit */}
      <PlannerBoard
        days={days}
        activeId={activeId}
        sensors={sensors}
        collisionDetection={collisionDetection}
        handleDragStart={handleDragStart}
        handleDragOver={handleDragOver}
        onSelectActivity={(activity) => {
          setSelectedActivity(activity);
        }}
        /* Create a blank activity and immediately open the modal */
        onAddNew={(dayId) => {
          const newActivity: Activity = {
            id: `temp-${Date.now()}`,
            title: '',
            description: '',
            duration: 0,
            color: DEFAULT_COLORS[DEFAULT_NEW_CARD_COLOR_INDEX],
            startTime: '',
            imageUrl: undefined,
          };
          setSelectedActivity({ ...newActivity, dayId });
        }}
      />

      {/* Activity editing modal */}
      {selectedActivity && (
        <ActivityModal
          open={true}
          activity={selectedActivity}
          // list of all POI names for the autocomplete input:
          poiOptions={poiOptions}
          // Save color when closing by X or by clicking the backdrop
          onClose={() => {
            setSelectedActivity(null);
          }}
          onSave={(patch) => {
            if (!patch.title || !patch.title.trim()) return;
            // If it's a temporary card → add it
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
              // Existing card → update
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
            if (selectedActivity.title.trim()) {
              updateActivity(selectedActivity.id, { color: newColor });
            }
          }}
        />
      )}
    </>
  );
}
