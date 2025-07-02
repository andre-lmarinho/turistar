// src/components/dnd/DayColumn.tsx
"use client";

import React from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import type { DayPlan, Activity } from "@/types/itinerary";
import { SortableItem } from "@/components/dnd/SortableItem";

interface DayColumnProps {
  day: DayPlan;
  onRemove?: () => void;
  onSelectActivity?: (activity: Activity) => void;  // ← NEW
}

/**
 * Renders one day's column of activities as a droppable list.
 * Now supports click-to-edit via `onSelectActivity`.
 */
export default function DayColumn({
  day,
  onRemove,
  onSelectActivity,   // ← NEW
}: DayColumnProps) {
  // register the <ul> as droppable with id = day.id
  const { setNodeRef, isOver } = useDroppable({ id: day.id });

  return (
    <section className="flex-1 min-w-[250px] p-2">
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
          {day.activities.map((activity) => (
            <SortableItem
              key={activity.id}
              id={activity.id}
              activity={activity}
              onSelect={() => onSelectActivity?.(activity)}  // ← NEW
            />
          ))}
        </ul>
      </SortableContext>
    </section>
  );
}
