// src/features/planner/components/dnd/PlannerBoard.tsx
'use client';

import React from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

import DayColumn from '@/features/planner/components/dnd/DayColumn';
import SortableItem from '@/features/planner/components/dnd/SortableItem';
import { useActivitiesById } from '@/features/planner/hooks/useActivitiesById';
import { usePlannerContext } from '@/features/planner/hooks/PlannerContext';

/**
 * Presentation component to render the DnD board.
 * Receives state and handlers from parent via props.
 */
function PlannerBoard() {
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
    changeDay,
    changePosition,
    changeColor,
    removeActivity,
    updateActivity,
    selectedActivity,
  } = usePlannerContext();

  const byId = useActivitiesById(days);
  const active = activeId ? byId[activeId] : null;

  const handleUpdateImage = (id: string, url: string) => {
    updateActivity(id, { imageUrl: url });
    if (selectedActivity && selectedActivity.id === id) {
      setSelectedActivity({ ...selectedActivity, imageUrl: url });
    }
  };

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
              days={days}
              onAddActivity={(dayId, idx) => addBlankAndSelect(dayId, idx)}
              onSelectActivity={(a) => setSelectedActivity(a)}
              onUpdateTitle={(id, title) => updateActivity(id, { title })}
              onChangeDay={(activityId, dayId) => changeDay(activityId, dayId)}
              onChangePosition={(activityId, idx) => changePosition(activityId, idx)}
              onChangeColor={(activityId, color) => changeColor(activityId, color)}
              onDelete={removeActivity}
              onUpdateImage={handleUpdateImage}
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
            availableDays={days}
            onChangeDay={(newDayId) => changeDay(active.id, newDayId)}
            onChangePosition={(idx) => changePosition(active.id, idx)}
            onChangeColor={(newColor) => changeColor(active.id, newColor)}
            bgColor={active.color}
            onDelete={() => removeActivity(active.id)}
            onUpdateImage={(url) => handleUpdateImage(active.id, url)}
            aria-grabbed="true"
            aria-label={`Dragging ${active.title}`}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}

export default React.memo(PlannerBoard);
