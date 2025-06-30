// src/app/planner/PlannerClient.tsx
"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { addDays, formatISO } from "date-fns";
import { closestCenter, DndContext, DragOverlay } from "@dnd-kit/core";

import DayColumn from "@/components/dnd/DayColumn";
import { SortableItem } from "@/components/dnd/SortableItem";
import { DateRangePicker } from "@/components/ui/date-picker";

import { useItinerary } from "@/hooks/useItinerary";
import { useDnDPlanner } from "@/hooks/useDnDPlanner";
import { useTripRange } from "@/hooks/useTripRange";
import { distributeRoundRobin } from "@/utils/distributeRoundRobin";

import { DayPlan, Activity } from "@/types/itinerary";

/* “+ Day” helper */
function AddDayButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="h-[200px] min-w-[120px] flex items-center justify-center border-2 border-dashed rounded-md text-muted-foreground"
    >
      + Day
    </button>
  );
}

export default function PlannerClient() {
  const params = useSearchParams();
  const dest   = params.get("dest")?.trim().toLowerCase() ?? "";

  const { tripDays, currentRange, handleRangeChange } = useTripRange(dest);

  const baseDays: DayPlan[] = useMemo(
    () =>
      tripDays.map((d) => ({
        id: formatISO(d, { representation: "date" }),
        label: d.toLocaleDateString("en-US", { weekday: "short", day: "2-digit" }),
        activities: [],
      })),
    [tripDays]
  );

  const { days: fetched, isLoading, error } = useItinerary(dest);
  const { days, setDays, sensors, activeId, handleDragStart, handleDragEnd, addDay, removeDay } =
    useDnDPlanner(baseDays);

  useEffect(() => {
    if (!fetched) return;
    const acts: Activity[] = fetched.flatMap((d) => d.activities);
    setDays(distributeRoundRobin(baseDays, acts));
  }, [fetched, baseDays, setDays]);

  if (!dest)        return <p className="p-4">Destination missing in URL.</p>;
  if (isLoading)    return <p className="p-4">Loading itinerary…</p>;
  if (error)        return <p className="p-4">Failed to load.</p>;
  if (!days.length) return <p className="p-4">No itinerary found.</p>;

  const overlay = activeId ? <SortableItem id={activeId} dragOverlay /> : null;

  return (
    <>
      <div className="mb-4 max-w-sm">
        <DateRangePicker value={currentRange} onChange={handleRangeChange} />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto">
          {days.map((d) => (
            <DayColumn key={d.id} day={d} onRemove={() => removeDay(d.id)} />
          ))}
          <AddDayButton onClick={() => addDay(tripDays.length ? addDays(tripDays.at(-1)!, 1) : new Date())} />
        </div>
        <DragOverlay>{overlay}</DragOverlay>
      </DndContext>
    </>
  );
}
