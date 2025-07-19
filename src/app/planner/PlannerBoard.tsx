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
  type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

import { DayColumn, SortableItem, DragOverlayFallback } from '@/components';
import { useActivitiesById } from '@/hooks';
import type { Activity, DayPlan } from '@/types';

export interface PlannerBoardProps {
  days: DayPlan[];
  activeId: string | null;
  sensors: SensorDescriptor<SensorOptions>[];
  collisionDetection: CollisionDetection;
  handleDragStart: (e: DragStartEvent) => void;
  handleDragOver: (e: DragOverEvent) => void;
  handleDragEnd: (e: DragEndEvent) => void;
  onSelectActivity: (activity: Activity & { dayId: string }) => void;
  onAddActivity: (dayId: string, index?: number) => void;
  onUpdateTitle: (id: string, title: string) => void;
  onChangeDay: (activityId: string, dayId: string) => void;
  onChangeColor: (activityId: string, color: string) => void;
  onDelete: (activityId: string) => void;
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
  handleDragEnd,
  onSelectActivity,
  onAddActivity,
  onUpdateTitle,
  onChangeDay,
  onChangeColor,
  onDelete,
}: PlannerBoardProps) {
  const byId = useActivitiesById(days);
  const active = activeId ? byId[activeId] : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToWindowEdges]}
    >
      <div className="p-4 md:mb-10 bg-background flex flex-1 w-full gap-4 overflow-x-auto h-full rounded-xl snap-x snap-mandatory border">
        {days.map((d) => (
          <div key={d.id} className="min-w-[250px] flex-shrink-0">
            <DayColumn
              key={d.id}
              day={d}
              days={days}
              onAddActivity={onAddActivity}
              onSelectActivity={onSelectActivity}
              onUpdateTitle={onUpdateTitle}
              onChangeDay={(activityId, dayId) => onChangeDay(activityId, dayId)}
              onChangeColor={(activityId, color) => onChangeColor(activityId, color)}
              onDelete={onDelete}
            />
          </div>
        ))}
      </div>
      <DragOverlay>
        {active ? (
          <SortableItem
            dragOverlay
            id={active.id}
            activity={active}
            availableDays={days}
            onChangeDay={(newDayId) => onChangeDay(active.id, newDayId)}
            onChangeColor={(newColor) => onChangeColor(active.id, newColor)}
            bgColor={active.color}
            onDelete={() => onDelete(active.id)}
          />
        ) : (
          <DragOverlayFallback />
        )}
      </DragOverlay>
    </DndContext>
  );
}
