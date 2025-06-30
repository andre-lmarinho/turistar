"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { DayPlan } from "@/types/itinerary";
import { SortableItem } from "./SortableItem";

export default function DayColumn({ day }: { day: DayPlan }) {
  const { setNodeRef, isOver } = useDroppable({ id: day.id });

  return (
    <section
      ref={setNodeRef}
      className={`flex-1 min-w-[250px] p-2 rounded-md border transition
        ${isOver ? "ring-2 ring-primary/40" : ""}`}
    >
      <h4 className="mb-2 font-semibold">{day.label}</h4>

      <SortableContext
        items={day.activities.map((a) => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="space-y-2">
          {day.activities.map((a) => (
            <SortableItem key={a.id} id={a.id}>
              <h3 className="font-medium">{a.title}</h3>
              <p className="text-sm text-muted-foreground">{a.description}</p>
              <span className="text-xs">≈ {a.duration} min</span>
            </SortableItem>
          ))}
        </ul>
      </SortableContext>
    </section>
  );
}
