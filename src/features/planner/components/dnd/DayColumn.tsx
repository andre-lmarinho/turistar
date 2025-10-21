'use client';

import React, { useEffect, useRef } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

import { SortableItem } from './SortableItem';
import { AddCardButton } from './AddCardButton';
import type { DayPlan, Activity } from '@/features/planner/domain/types/PlannerEntities';

interface DayColumnProps {
  day: DayPlan;
  onSelectActivity?: (activity: Activity & { dayId: string }) => void;
  onAddActivity: (dayId: string, index?: number) => void;
}

/**
 * Renders one day's column of activities as a droppable list.
 * Supports click-to-edit and adding new blank cards.
 */
export function DayColumn({ day, onSelectActivity, onAddActivity }: DayColumnProps) {
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
      <div className="flex px-3 pt-2 text-[var(--muted-foreground)]">
        <h2 className="text-sm font-semibold">{day.label}</h2>
      </div>

      <SortableContext
        key={day.id}
        id={day.id}
        items={day.activities.map((a) => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <div ref={scrollRef} data-testid="day-scroll" className="overflow-y-auto pt-2">
          {day.activities.map((activity, idx) => (
            <React.Fragment key={activity.id}>
              {idx < day.activities.length - 0 && (
                <AddCardButton
                  position="insert"
                  dayId={day.id}
                  index={idx}
                  onAddActivity={onAddActivity}
                />
              )}
              <SortableItem
                id={activity.id}
                activity={{ ...activity, dayId: day.id }}
                onSelect={() => onSelectActivity?.({ ...activity, dayId: day.id })}
                bgColor={activity.color}
              />
            </React.Fragment>
          ))}
        </div>
      </SortableContext>
      <div className="py-2">
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
