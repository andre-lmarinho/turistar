// src/components/planner/dnd/DayColumn.tsx
'use client';

import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

import { SortableItem, AddNewCard, InsertNewCard } from '@/components';
import type { DayPlan, Activity } from '@/types';

interface DayColumnProps {
  day: DayPlan;
  onRemove?: () => void;
  onSelectActivity?: (activity: Activity) => void;
  onAddNew: (dayId: string, index?: number) => void; // add a blank activity to this day
  onUpdateTitle?: (id: string, title: string) => void;
}

/**
 * Renders one day's column of activities as a droppable list.
 * Supports click-to-edit and adding new blank cards.
 */
export default function DayColumn({
  day,
  onSelectActivity,
  onAddNew,
  onUpdateTitle,
}: DayColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: day.id });

  return (
    <section ref={setNodeRef} className={`flex-1 ${isOver ? 'ring-2 ring-primary/40' : ''}`}>
      <header className="m-2 flex items-center justify-between">
        <h4 className="font-semibold">{day.label}</h4>
      </header>

      <SortableContext
        items={day.activities.map((a) => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul ref={setNodeRef} className={`mb-4 ${isOver ? 'ring-2 ring-primary/40' : ''}`}>
          {day.activities.map((activity, idx) => (
            <React.Fragment key={activity.id}>
              <SortableItem
                id={activity.id}
                activity={activity}
                onSelect={() => onSelectActivity?.(activity)}
                onTitleSave={(newTitle) => onUpdateTitle?.(activity.id, newTitle)}
              />
              {idx < day.activities.length - 1 && (
                <InsertNewCard dayId={day.id} index={idx + 1} onAddNew={onAddNew} />
              )}
            </React.Fragment>
          ))}
        </ul>
      </SortableContext>

      {/* Add a “New card” button at the bottom */}
      <div className="flex justify-center">
        <AddNewCard dayId={day.id} index={day.activities.length} onAddNew={onAddNew} />
      </div>
    </section>
  );
}
