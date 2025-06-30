"use client";

import { useEffect } from "react"; 
import { useSearchParams } from "next/navigation";
import { closestCenter, DndContext } from "@dnd-kit/core";
import { useItinerary } from "@/hooks/useItinerary";
import { useDnDPlanner } from "@/hooks/useDnDPlanner";
import DayColumn from "@/components/dnd/DayColumn";

export default function PlannerPage() {
  const params = useSearchParams();
  const dest = params.get("dest")?.trim().toLowerCase() ?? "";

  const { days: fetchedDays, isLoading, error } = useItinerary(dest);
  const { days, sensors, moveCard, setDays } = useDnDPlanner(fetchedDays);

  // When fetch finishes, load into DnD hook once
  useEffect(() => {
    if (fetchedDays) setDays(fetchedDays);
  }, [fetchedDays, setDays]);

  if (!dest)        return <p className="p-4">Destination missing in URL.</p>;
  if (isLoading)    return <p className="p-4">Loading itinerary…</p>;
  if (error)        return <p className="p-4">Failed to load.</p>;
  if (!days?.length) return <p className="p-4">No itinerary found.</p>;

  return (
    <main className="p-4">
      <h2 className="text-xl font-semibold mb-4 capitalize">{dest} itinerary</h2>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={moveCard}
      >
        <div className="flex gap-4 overflow-x-auto">
          {days.map((d) => (
            <DayColumn key={d.id} day={d} />
          ))}
        </div>
      </DndContext>
    </main>
  );
}
