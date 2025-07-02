// src/app/planner/PlannerClient.tsx
"use client";

import React, { useState, useMemo } from "react";
import { DateRangePicker } from "@/components/ui/date-picker";
import PlannerBoard from "@/app/planner/PlannerBoard";
import DestinationFilterPanel from "@/app/planner/DestinationFilterPanel";
import ActivityModal from "@/components/planner/ActivityModal";
import { usePlanner } from "@/hooks/usePlanner";
import type { Activity } from "@/types/itinerary";

// TODO: replace with real list from your data source
import salvador from "@/data/salvador.json";


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

  // Build list of POI names for autocomplete
  const poiOptions = useMemo(
    () => salvador.activities.map((a) => a.name),
    []
  );

  /* Filter-panel visibility */
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  /* Selected activity for editing in the modal */
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  /* Guard clauses */
  if (!dest)         return <p className="p-4">Destination missing in URL.</p>;
  if (isLoading)     return <p className="p-4">Loading itinerary…</p>;
  if (error)         return <p className="p-4">Failed to load.</p>;
  if (!days.length)  return <p className="p-4">No itinerary found.</p>;

  return (
    <>
      {/* Date picker + “Open Panel” button */}
      <div className="mb-4 max-w-sm flex items-center space-x-2">
        <DateRangePicker value={currentRange} onChange={handleRangeChange} />
        <button
          onClick={() => setIsPanelOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Open Panel
        </button>
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
        onSelectActivity={(activity) => setSelectedActivity(activity)}  // ← click handler
      />

      {/* Activity editing modal */}
      {selectedActivity && (
        <ActivityModal
          open={true}
          activity={selectedActivity}
          // list of all POI names for the autocomplete input:
          poiOptions={poiOptions}
          onClose={() => setSelectedActivity(null)}
          onSave={(patch) => {
            updateActivity(selectedActivity.id, patch);
            setSelectedActivity(null);
          }}
          onDelete={() => {
            removeActivity(selectedActivity.id);
            setSelectedActivity(null);
          }}
        />
      )}
    </>
  );
}
