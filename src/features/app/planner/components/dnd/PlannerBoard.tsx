'use client';

import React from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

import { DayColumn } from '@/features/app/planner/components/dnd/DayColumn';
import { SortableItem } from '@/features/app/planner/components/dnd/SortableItem';
import { useActivitiesById } from '@/features/app/planner/hooks/state/planner/useActivitiesById';
import { usePlannerContext } from '@/features/app/planner/hooks/PlannerContext';

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
    canEdit,
  } = usePlannerContext();

  const byId = useActivitiesById(days);
  const active = activeId ? byId[activeId] : null;
  const handleSelect = canEdit
    ? (activity: Parameters<typeof setSelectedActivity>[0]) => setSelectedActivity(activity)
    : undefined;

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
          <div key={d.id} role="listitem" className="w-[234px] shrink-0">
            <DayColumn day={d} onSelectActivity={handleSelect} canEdit={canEdit} />
          </div>
        ))}
      </div>
      {canEdit ? (
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
      ) : null}
    </DndContext>
  );
});

PlannerBoard.displayName = 'PlannerBoard';
