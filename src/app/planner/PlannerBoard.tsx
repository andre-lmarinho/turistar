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
import type { Activity, DayPlan, CatalogActivity } from '@/types';

export interface PlannerBoardProps {
  days: DayPlan[];
  dest: string;
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
  onChangePosition: (activityId: string, index: number) => void;
  onChangeColor: (activityId: string, color: string) => void;
  onDelete: (activityId: string) => void;
  onUpdateImage?: (activityId: string, url: string) => void;
  onApplyCatalogItem?: (activityId: string, item: CatalogActivity) => void;
}

/**
 * Presentation component to render the DnD board.
 * Receives state and handlers from parent via props.
 */
export default function PlannerBoard({
  days,
  dest,
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
  onChangePosition,
  onChangeColor,
  onDelete,
  onUpdateImage,
  onApplyCatalogItem,
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
      <div
        role="list"
        aria-label="Days"
        tabIndex={0}
        className="bg-background flex h-full flex-1 gap-4 overflow-x-auto overflow-y-hidden rounded-xl border p-4"
      >
        {days.map((d) => (
          <div key={d.id} role="listitem" className="min-w-[250px] flex-shrink-0">
            <DayColumn
              dest={dest}
              day={d}
              days={days}
              onAddActivity={onAddActivity}
              onSelectActivity={onSelectActivity}
              onUpdateTitle={onUpdateTitle}
              onChangeDay={(activityId, dayId) => onChangeDay(activityId, dayId)}
              onChangePosition={(activityId, idx) => onChangePosition(activityId, idx)}
              onChangeColor={(activityId, color) => onChangeColor(activityId, color)}
              onDelete={onDelete}
              onUpdateImage={onUpdateImage}
              onApplyCatalogItem={onApplyCatalogItem}
            />
          </div>
        ))}
      </div>
      <DragOverlay aria-label={active ? `Dragging ${active.title}` : undefined}>
        {active ? (
          <SortableItem
            dragOverlay
            id={active.id}
            dest={dest}
            activity={active}
            availableDays={days}
            onChangeDay={(newDayId) => onChangeDay(active.id, newDayId)}
            onChangePosition={(idx) => onChangePosition(active.id, idx)}
            onChangeColor={(newColor) => onChangeColor(active.id, newColor)}
            bgColor={active.color}
            onDelete={() => onDelete(active.id)}
            onUpdateImage={(url) => onUpdateImage?.(active.id, url)}
            onApplyCatalogItem={(item) => onApplyCatalogItem?.(active.id, item)}
            aria-grabbed="true"
            aria-label={`Dragging ${active.title}`}
          />
        ) : (
          <div aria-live="assertive">
            <DragOverlayFallback />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
