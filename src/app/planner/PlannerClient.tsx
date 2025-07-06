// src/app/planner/PlannerClient.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { DateRangePicker } from '@/components/ui/DatePicker';
import OpenPanelButton from '@/components/ui/BtnOpenCatalog';
import PlannerBoard from '@/app/planner/PlannerBoard';
import DestinationFilterPanel from '@/components/planner/catalog/DestinationFilterPanel';
import ActivityModal from '@/components/planner/modal/ActivityModal';
import { usePlanner } from '@/hooks/usePlanner';
import type { Activity, CatalogActivity } from '@/types/itinerary';
import { DEFAULT_COLORS, DEFAULT_NEW_CARD_COLOR_INDEX } from '@/constants/colors';

/**
 * Top-level client component for the /planner route.
 * - Shows the date-range picker, the “Open Panel” button, the filter panel,
 *   and the drag-and-drop board.
 * - Handles selecting a card to open the ActivityModal.
 */
export default function PlannerClient() {
  // Track whether filter panel is open
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  // Fetch immediately on mount
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
    addBlankActivity,
    removeActivity,
    updateActivity,
  } = usePlanner(true);

  /* Build a Set of activity IDs already placed on the board */
  const addedIds = useMemo(
    () => new Set(days.flatMap((d) => d.activities.map((a) => a.id))),
    [days]
  );

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
        onUpdateTitle={(id, newTitle) => {
          updateActivity(id, { title: newTitle });
        }}
        /* Create a blank activity and immediately open the modal */
        onAddNew={(dayId) => {
          const idx = days.findIndex((d) => d.id === dayId);
          const blank = addBlankActivity(idx);
          setSelectedActivity({ ...blank, dayId });
        }}
      />

      {/* Activity editing modal */}
      {selectedActivity && (
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
            // Always allow changing color in the modal
            setSelectedActivity({ ...selectedActivity, color: newColor });

            // Only update the board if the activity already has a valid title
            if (selectedActivity.title.trim() && !selectedActivity.id.startsWith('temp-')) {
              updateActivity(selectedActivity.id, { color: newColor });
            }
          }}
        />
      )}
    </>
  );
}
