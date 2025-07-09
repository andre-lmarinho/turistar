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

import { DayColumn, SortableItem } from '@/components';
import type { Activity, DayPlan } from '@/types';

export interface PlannerBoardProps {
  /** Board columns of activities */
  days: DayPlan[];
  /** Currently dragged card ID */
  activeId: string | null;
  /** DnD-kit sensors */
  sensors: SensorDescriptor<SensorOptions>[];
  /** Collision detection strategy */
  collisionDetection: CollisionDetection;
  /** Start dragging handler */
  handleDragStart: (e: DragStartEvent) => void;
  /** Drag-over handler to reorder */
  handleDragOver: (e: DragOverEvent) => void;
  /** Called when user clicks a card to edit */
  onSelectActivity: (activity: Activity) => void;
  /** Called when user clicks + New Card Button */
  onAddNew: (dayId: string, index?: number) => void;
  /** Inline title update */
  onUpdateTitle: (id: string, title: string) => void;
}

/**
 * Presentation component to render the DnD board.
 * Receives state and handlers from parent via props.
 */
export default function PlannerBoard({
  days,
  activeId,
  sensors,
  collisionDetection,
  handleDragStart,
  handleDragOver,
  onSelectActivity,
  onAddNew,
  onUpdateTitle,
}: PlannerBoardProps) {
  const activeActivity = days.flatMap((d) => d.activities).find((a) => a.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
    >
      {/* Horizontal scroll of day columns */}
      <div className="p-4 md:mb-10 bg-background flex flex-1 w-full gap-4 overflow-x-auto h-full rounded-xl border">
        {days.map((day) => (
          <div key={day.id} className="flex flex-col flex-shrink-0 min-w-[250px]">
            <DayColumn
              day={day}
              onAddNew={onAddNew}
              onSelectActivity={onSelectActivity}
              onUpdateTitle={onUpdateTitle}
            />
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
