// src/app/planner/PlannerBoard.tsx
'use client';

import React from 'react';
import {
  DndContext,
  DragOverlay,
  type SensorDescriptor,
  type SensorOptions,
  type CollisionDetection,
  type DragStartEvent,
  type DragOverEvent,
} from '@dnd-kit/core';

import DayColumn from '@/components/planner/dnd/DayColumn';
import { SortableItem } from '@/components/planner/dnd/SortableItem';
import type { DayPlan, Activity } from '@/types/itinerary';

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
  onAddNew: (dayId: string) => void;
}

export default function PlannerBoard({
  days = [], // normalize undefined
  activeId,
  sensors,
  collisionDetection,
  handleDragStart,
  handleDragOver,
  onSelectActivity,
  onAddNew,
}: PlannerBoardProps) {
  // find the active activity for the DragOverlay preview
  const activeActivity = days.flatMap((d) => d.activities).find((a) => a.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
    >
      {/* Horizontal scroll of day columns */}
      <div className="p-4 md:mb-10 bg-background flex w-full gap-4 overflow-x-auto h-full rounded-xl border">
        {days.map((day) => (
          <div key={day.id} className="flex flex-col flex-shrink-0 min-w-[250px]">
            {/* Pass click handler down to each column */}
            <DayColumn day={day} onAddNew={onAddNew} onSelectActivity={onSelectActivity} />
          </div>
        ))}
      </div>

      {/* Floating preview of the dragged card */}
      <DragOverlay>
        {activeActivity && (
          <SortableItem id={activeActivity.id} dragOverlay={true} activity={activeActivity} />
        )}
      </DragOverlay>
    </DndContext>
  );
}
