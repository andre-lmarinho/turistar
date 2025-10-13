'use client';

import React from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

import { DayColumn } from '@/features/planner/components/dnd/DayColumn';
import { SortableItem } from '@/features/planner/components/dnd/SortableItem';
import { useActivitiesById } from '@/features/planner/hooks/useActivitiesById';
import { usePlannerContext } from '@/features/planner/hooks/PlannerContext';

/**
 * Presentation component to render the DnD board.
 * Receives state and handlers from parent via props.
 */
export const PlannerBoard = React.memo(function PlannerBoard() {
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
  } = usePlannerContext();

  const byId = useActivitiesById(days);
  const active = activeId ? byId[activeId] : null;

  return (
    <DndContext
      id="planner-dnd"
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
          <div key={d.id} role="listitem" className="w-[234px] flex-shrink-0">
            <DayColumn
              day={d}
              onAddActivity={(dayId, idx) => addBlankAndSelect(dayId, idx)}
              onSelectActivity={(a) => setSelectedActivity(a)}
            />
          </div>
        ))}
      </div>
      <DragOverlay aria-label={active ? `Dragging ${active.title}` : undefined}>
        {active && (
          <SortableItem
            dragOverlay
            id={active.id}
            activity={active}
            bgColor={active.color}
            aria-grabbed="true"
            aria-label={`Dragging ${active.title}`}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
});

PlannerBoard.displayName = 'PlannerBoard';
