// src/app/planner/PlannerBoardVertical.tsx
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

export interface PlannerBoardVerticalProps {
  days: DayPlan[];
  activeId: string | null;
  sensors: SensorDescriptor<SensorOptions>[];
  collisionDetection: CollisionDetection;
  handleDragStart: (e: DragStartEvent) => void;
  handleDragOver: (e: DragOverEvent) => void;
  onSelectActivity: (activity: Activity) => void;
  onAddNew: (dayId: string, index?: number) => void;
  onUpdateTitle: (id: string, title: string) => void;
}

/**
 * Vertical variant of the planner board.
 * Stacks DayColumn components top to bottom.
 */
export default function PlannerBoardVertical({
  days,
  activeId,
  sensors,
  collisionDetection,
  handleDragStart,
  handleDragOver,
  onSelectActivity,
  onAddNew,
  onUpdateTitle,
}: PlannerBoardVerticalProps) {
  const activeActivity = days.flatMap((d) => d.activities).find((a) => a.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
    >
      {/* Vertical list of days */}
      <div className="p-4 md:mb-10 bg-background flex flex-col w-full gap-4 overflow-y-auto rounded-xl border">
        {days.map((day) => (
          <div key={day.id} className="flex flex-col">
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
