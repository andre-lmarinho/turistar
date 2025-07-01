// src/app/planner/PlannerClient.tsx
"use client";

import { DateRangePicker } from "@/components/ui/date-picker";
import PlannerBoard from "./PlannerBoard";
import { usePlanner } from "@/hooks/usePlanner";

/**
 * Top-level client component for /planner
 * — just wires up the hook and renders the board.
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
  } = usePlanner();

  // Simple guard rendering
  if (!dest)        return <p className="p-4">Destination missing in URL.</p>;
  if (isLoading)    return <p className="p-4">Loading itinerary…</p>;
  if (error)        return <p className="p-4">Failed to load.</p>;
  if (!days.length) return <p className="p-4">No itinerary found.</p>;

  return (
    <>
      <div className="mb-4 max-w-sm">
        <DateRangePicker
          value={currentRange}
          onChange={handleRangeChange}
        />
      </div>

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
