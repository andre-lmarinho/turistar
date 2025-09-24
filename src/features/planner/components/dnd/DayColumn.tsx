// src/features/planner/components/dnd/DayColumn.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

import SortableItem from './SortableItem';
import { AddCardButton } from '@/shared/ui';
import type { DayPlan, Activity } from '@/shared/types';

interface DayColumnProps {
  day: DayPlan;
  days: DayPlan[];
  onSelectActivity?: (activity: Activity & { dayId: string }) => void;
  onAddActivity: (dayId: string, index?: number) => void;
  onUpdateTitle?: (id: string, title: string) => void;
  onChangeDay: (activityId: string, dayId: string) => void;
  onChangePosition: (activityId: string, index: number) => void;
  onChangeColor: (activityId: string, color: string) => void;
  onDelete: (activityId: string) => void;
  onUpdateImage?: (activityId: string, url: string) => void;
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
  onChangePosition,
  onChangeColor,
  onDelete,
  onUpdateImage,
}: DayColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: day.id });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (day.activities.length <= 1) {
      scrollRef.current?.scrollTo(0, 0);
    }
  }, [day.activities.length]);

  return (
    <section
      ref={setNodeRef}
      className={`flex h-full flex-1 flex-col ${isOver ? 'ring-primary/40 ring-2' : ''}`}
    >
      <header className="m-2 flex text-[var(--muted-foreground)]">
        <h2 className="text-sm font-medium">{day.label}</h2>
      </header>

      <SortableContext
        key={day.id}
        id={day.id}
        items={day.activities.map((a) => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <div ref={scrollRef} data-testid="day-scroll" className="overflow-y-auto pr-1">
          {day.activities.map((activity, idx) => (
            <React.Fragment key={activity.id}>
              <SortableItem
                id={activity.id}
                activity={{ ...activity, dayId: day.id }}
                availableDays={days}
                onSelect={() => onSelectActivity?.({ ...activity, dayId: day.id })}
                onTitleSave={(newTitle) => onUpdateTitle?.(activity.id, newTitle)}
                onChangeDay={(newDayId) => onChangeDay(activity.id, newDayId)}
                onChangePosition={(idx) => onChangePosition(activity.id, idx)}
                onChangeColor={(newColor) => onChangeColor(activity.id, newColor)}
                onDelete={() => onDelete(activity.id)}
                onUpdateImage={(url) => onUpdateImage?.(activity.id, url)}
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
