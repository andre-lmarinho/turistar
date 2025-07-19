// src/components/planner/dnd/DayColumn.tsx
'use client';

import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

import { SortableItem, AddCardButton } from '@/components';
import type { DayPlan, Activity } from '@/types';

interface DayColumnProps {
  day: DayPlan;
  days: DayPlan[];
  onSelectActivity?: (activity: Activity & { dayId: string }) => void;
  onAddActivity: (dayId: string, index?: number) => void;
  onUpdateTitle?: (id: string, title: string) => void;
  onChangeDay: (activityId: string, dayId: string) => void;
  onChangeColor: (activityId: string, color: string) => void;
  onDelete: (activityId: string) => void;
}

/**
 * Renders one day's column of activities as a droppable list.
 * Supports click-to-edit and adding new blank cards.
 */
export default function DayColumn({
  day,
  days,
  onSelectActivity,
  onAddActivity,
  onUpdateTitle,
  onChangeDay,
  onChangeColor,
  onDelete,
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
        <div className="column overflow-y-auto pr-1">
          {day.activities.map((activity, idx) => (
            <React.Fragment key={activity.id}>
              <SortableItem
                id={activity.id}
                activity={{ ...activity, dayId: day.id }}
                availableDays={days}
                onSelect={() => onSelectActivity?.({ ...activity, dayId: day.id })}
                onTitleSave={(newTitle) => onUpdateTitle?.(activity.id, newTitle)}
                onChangeDay={(newDayId) => onChangeDay(activity.id, newDayId)}
                onChangeColor={(newColor) => onChangeColor(activity.id, newColor)}
                onDelete={() => onDelete(activity.id)}
                bgColor={activity.color}
              />
              {idx < day.activities.length - 1 && (
                <AddCardButton
                  position="insert"
                  dayId={day.id}
                  index={idx + 1}
                  onAddActivity={onAddActivity}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </SortableContext>

      <div className="mt-4 flex justify-center">
        <AddCardButton
          position="new"
          dayId={day.id}
          index={day.activities.length}
          onAddActivity={onAddActivity}
        />
      </div>
    </section>
  );
}
