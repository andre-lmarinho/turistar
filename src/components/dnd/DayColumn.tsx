// src/components/dnd/DayColumn.tsx
"use client";

import React from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import type { DayPlan, Activity } from "@/types/itinerary";
import { SortableItem } from "@/components/dnd/SortableItem";
import AddNewCard from "@/components/planner/AddNewCard";
import { DEFAULT_COLORS } from "@/constants/colors";

interface DayColumnProps {
  day: DayPlan;
  onRemove?: () => void;
  onSelectActivity?: (activity: Activity) => void;
  onAddNew?: (dayId: string) => void;  // add a blank activity to this day
}

/**
 * Renders one day's column of activities as a droppable list.
 * Supports click-to-edit and adding new blank cards.
 */
export default function DayColumn({
  day,
  onRemove,
  onSelectActivity,
  onAddNew,
}: DayColumnProps) {
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
              onSelect={() => onSelectActivity?.(activity)}
            />
          ))}
        </ul>
      </SortableContext>

      {/* Add a “New card” button at the bottom */}
      <div className="mt-4 flex justify-center">
        <AddNewCard
          colorClass={DEFAULT_COLORS[2]}
          onClick={() => {
            onAddNew?.(day.id);
          }}
        />
      </div>
    </section>
  );
}
