// src/app/planner/PlannerClient.tsx
"use client";

import { useState, useMemo } from "react";
import { DateRangePicker } from "@/components/ui/date-picker";
import PlannerBoard from "@/app/planner/PlannerBoard";
import DestinationFilterPanel from "./DestinationFilterPanel";
import { usePlanner } from "@/hooks/usePlanner";

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
  } = usePlanner();

  // Conjunto de IDs já presentes no board
  const addedIds = useMemo(
    () => new Set(days.flatMap((d) => d.activities.map((a) => a.id))),
    [days]
  );

  // Estado de visibilidade do painel
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  /* Guard clauses */
  if (!dest)         return <p className="p-4">Destination missing in URL.</p>;
  if (isLoading)     return <p className="p-4">Loading itinerary…</p>;
  if (error)         return <p className="p-4">Failed to load.</p>;
  if (!days?.length) return <p className="p-4">No itinerary found.</p>;

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
        addedIds={addedIds}
      />

      {/* Drag-and-Drop board */}
      <PlannerBoard
        days={days}
        activeId={activeId}
        sensors={sensors}
        collisionDetection={collisionDetection}
        handleDragStart={handleDragStart}
        handleDragOver={handleDragOver}
      />
    </>
  );
}
