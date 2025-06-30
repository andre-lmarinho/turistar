// src/components/dnd/DayColumn.tsx
"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { DayPlan } from "@/types/itinerary";
import { SortableItem } from "./SortableItem";

interface Props {
  day: DayPlan;
  onRemove?: () => void;
}

export default function DayColumn({ day, onRemove }: Props) {
  // register the <ul> as a droppable with id = day.id
  const { setNodeRef, isOver } = useDroppable({ id: day.id });

  return (
    <section className="flex-1 min-w-[250px] p-2 rounded-md border">
      <header className="mb-2 flex items-center justify-between">
        <h4 className="font-semibold">{day.label}</h4>
        {onRemove && (
          <button onClick={onRemove} className="text-xs text-red-500 hover:underline">
            ✕
          </button>
        )}
      </header>

      <SortableContext
        items={day.activities.map((a) => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul
          ref={setNodeRef}
          className={`space-y-2 min-h-[24px] p-1 ${
            isOver ? "ring-2 ring-primary/40" : ""
          }`}
        >
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
