// src/app/planner/PlannerBoard.tsx
'use client';

import React from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

import { DayColumn, SortableItem, DragOverlayFallback } from '@/components';
import { useActivitiesById } from '@/hooks';
import { usePlannerContext } from '@/contexts/PlannerContext';
import type { CatalogActivity } from '@/types';

export interface PlannerBoardProps {
  onUpdateImage?: (activityId: string, url: string) => void;
  onApplyCatalogItem?: (activityId: string, item: CatalogActivity) => void;
}

/**
 * Presentation component to render the drag-and-drop board.
 * Reads planner state and handlers from context.
 */
export default function PlannerBoard({ onUpdateImage, onApplyCatalogItem }: PlannerBoardProps) {
  const {
    days,
    activeId,
    sensors,
    collisionDetection,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    setSelectedActivity,
    addBlankAndSelect,
    updateActivity,
    changeDay,
    changePosition,
    changeColor,
    removeActivity,
  } = usePlannerContext();

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
              day={d}
              days={days}
              onAddActivity={addBlankAndSelect}
              onSelectActivity={setSelectedActivity}
              onUpdateTitle={(id, title) => updateActivity(id, { title })}
              onChangeDay={(activityId, dayId) => changeDay(activityId, dayId)}
              onChangePosition={(activityId, idx) => changePosition(activityId, idx)}
              onChangeColor={(activityId, color) => changeColor(activityId, color)}
              onDelete={removeActivity}
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
            activity={active}
            availableDays={days}
            onChangeDay={(newDayId) => changeDay(active.id, newDayId)}
            onChangePosition={(idx) => changePosition(active.id, idx)}
            onChangeColor={(newColor) => changeColor(active.id, newColor)}
            bgColor={active.color}
            onDelete={() => removeActivity(active.id)}
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
