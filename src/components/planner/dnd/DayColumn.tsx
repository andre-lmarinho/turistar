// src/components/planner/dnd/DayColumn.tsx
'use client';

import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

import { SortableItem, AddNewCard, InsertNewCard } from '@/components';
import type { DayPlan, Activity } from '@/types';

interface DayColumnProps {
  day: DayPlan;
  onSelectActivity?: (activity: Activity) => void;
  onAddActivity: (dayId: string, index?: number) => void;
  onUpdateTitle?: (id: string, title: string) => void;
}

/**
 * Renders one day's column of activities as a droppable list.
 * Supports click-to-edit and adding new blank cards.
 */
export default function DayColumn({
  day,
  onSelectActivity,
  onAddActivity,
  onUpdateTitle,
}: DayColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: day.id });

  return (
    <section
      ref={setNodeRef}
      className={`flex-1 flex flex-col h-full ${isOver ? 'ring-2 ring-primary/40' : ''}`}
    >
      <header className="m-2 flex items-center justify-between">
        <h2 className="font-semibold">{day.label}</h2>
      </header>

      <SortableContext
        key={day.id}
        id={day.id}
        items={day.activities.map((a) => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="column h-full overflow-y-auto pr-1">
          {day.activities.map((activity, idx) => (
            <React.Fragment key={activity.id}>
              <SortableItem
                id={activity.id}
                activity={activity}
                dragOverlay={false}
                onSelect={() => onSelectActivity?.(activity)}
                onTitleSave={(newTitle) => onUpdateTitle?.(activity.id, newTitle)}
              />
              {idx < day.activities.length - 1 && (
                <InsertNewCard dayId={day.id} index={idx + 1} onAddActivity={onAddActivity} />
              )}
            </React.Fragment>
          ))}
        </div>
      </SortableContext>

      <div className="mt-4 flex justify-center">
        <AddNewCard dayId={day.id} index={day.activities.length} onAddActivity={onAddActivity} />
      </div>
    </section>
  );
}
