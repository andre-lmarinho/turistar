// src/app/planner/PlannerBoard.tsx
"use client";

import React from "react";
import {
  DndContext,
  DragOverlay,
  type SensorDescriptor,
  type SensorOptions,
  type CollisionDetection,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core";

import DayColumn from "@/components/dnd/DayColumn";
import { SortableItem } from "@/components/dnd/SortableItem";
import ActivityCard from "@/components/planner/ActivityCard";
import type { DayPlan, Activity } from "@/types/itinerary";

export interface PlannerBoardProps {
  /** Board columns of activities */
  days?: DayPlan[];
  /** Currently dragged card ID */
  activeId: string | null;
  /** DnD-kit sensors */
  sensors: SensorDescriptor<SensorOptions>[];
  /** Collision detection strategy */
  collisionDetection: CollisionDetection;
  /** Start dragging handler */
  handleDragStart(e: DragStartEvent): void;
  /** Drag-over handler to reorder */
  handleDragOver(e: DragOverEvent): void;
  /** Called when user clicks a card to edit */
  onSelectActivity: (activity: Activity) => void;
  /** Called when user clicks + New Card Button */
  onAddNew?(dayId: string): void;     
}

export default function PlannerBoard({
  days = [],                  // normalize undefined
  activeId,
  sensors,
  collisionDetection,
  handleDragStart,
  handleDragOver,
  onSelectActivity,
  onAddNew,
}: PlannerBoardProps) {
  // find the active activity for the DragOverlay preview
  const activeActivity = days
    .flatMap((d) => d.activities)
    .find((a) => a.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
    >
      {/* Horizontal scroll of day columns */}
      <div className="p-4 flex gap-4 overflow-x-auto h-full min-h-64 rounded-md border">
        {days.map((day, index) => (
          <div key={day.id} className="flex items-stretch">
            {/* Pass click handler down to each column */}
            <DayColumn
              day={day}
              onSelectActivity={onSelectActivity}
              onAddNew={onAddNew}
            />
            {index !== days.length - 1 && (
              <div className="w-px bg-gray-300 mx-4" />
            )}
          </div>
        ))}
      </div>

      {/* Floating preview of the dragged card */}
      <DragOverlay>
        {activeActivity && (
          <SortableItem
            id={activeActivity.id}
            dragOverlay={true}
            activity={activeActivity}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
