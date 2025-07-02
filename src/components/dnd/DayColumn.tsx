// src/components/dnd/DayColumn.tsx
"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { DayPlan } from "@/types/itinerary";
import { SortableItem } from "@/components/dnd/SortableItem";
import ActivityCard from "@/components/planner/ActivityCard";

interface Props {
  day: DayPlan;
  onRemove?: () => void;
}

export default function DayColumn({ day, onRemove }: Props) {
  /* Register <ul> as droppable */
  const { setNodeRef, isOver } = useDroppable({ id: day.id });

  return (
    <section className="flex-1 min-w-[250px] p-2">
      {/* column header */}
      <header className="mb-2 flex items-center justify-between">
        <h4 className="font-semibold">{day.label}</h4>
        {onRemove && (
          <button
            onClick={onRemove}
            className="text-xs text-red-500 hover:underline"
          >
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
          className={`space-y-2 min-h-[24px] p-1 ${isOver ? "ring-2 ring-primary/40" : ""}`}
        >
          {day.activities.map((a) => (
            <SortableItem key={a.id} id={a.id}>
              {/* Passa o card como filho */}
              <ActivityCard activity={a} />
            </SortableItem>
          ))}
        </ul>
      </SortableContext>
    </section>
  );
}
