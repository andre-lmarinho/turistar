'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

import { SortableItem } from './SortableItem';
import { AddCardButton } from './AddCardButton';
import { InlineCard } from './InlineCard';
import { ActivityCard } from './ActivityCard';
import type { DayPlan, Activity } from '@/features/planner/domain/types/PlannerEntities';

interface DayColumnProps {
  day: DayPlan;
  onSelectActivity?: (activity: Activity & { dayId: string }) => void;
  canEdit?: boolean;
}

/**
 * Renders one day's column of activities as a droppable list.
 * Supports click-to-edit and adding new blank cards.
 */
export function DayColumn({ day, onSelectActivity, canEdit = true }: DayColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: day.id, disabled: !canEdit });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeInlineIndex, setActiveInlineIndex] = useState<number | null>(null);

  useEffect(() => {
    if (day.activities.length <= 1) {
      scrollRef.current?.scrollTo(0, 0);
    }
  }, [day.activities.length]);

  const handleOpenInline = useCallback((index: number) => {
    setActiveInlineIndex(index);
  }, []);

  const handleCloseInline = useCallback(() => {
    setActiveInlineIndex(null);
  }, []);

  const handleAdvanceInline = useCallback((nextIndex: number) => {
    setActiveInlineIndex(nextIndex);
  }, []);

  return (
    <section
      ref={canEdit ? setNodeRef : undefined}
      className={`flex h-full flex-1 flex-col ${isOver && canEdit ? 'ring-primary/40 ring-2' : ''}`}
    >
      <div className="flex px-3 pt-2 text-[var(--muted-foreground)]">
        <h2 className="text-sm font-semibold">{day.label}</h2>
      </div>

      {canEdit ? (
        <SortableContext
          key={day.id}
          id={day.id}
          items={day.activities.map((a) => a.id)}
          strategy={verticalListSortingStrategy}
        >
          <div ref={scrollRef} data-testid="day-scroll" className="overflow-y-auto pt-2">
            {day.activities.map((activity, idx) => (
              <React.Fragment key={activity.id}>
                {activeInlineIndex === idx ? (
                  <InlineCard
                    dayId={day.id}
                    insertIndex={idx}
                    className="my-2"
                    onClose={handleCloseInline}
                    onAdvanceInline={handleAdvanceInline}
                  />
                ) : (
                  <AddCardButton
                    placement="between"
                    dayId={day.id}
                    insertIndex={idx}
                    onInlineOpen={handleOpenInline}
                    isInlineOpen={activeInlineIndex === idx}
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
      ) : (
        <div ref={scrollRef} data-testid="day-scroll" className="overflow-y-auto pt-2">
          {day.activities.map((activity) => (
            <div key={activity.id} className="mb-3 last:mb-0">
              <ActivityCard activity={{ ...activity, dayId: day.id }} bgColor={activity.color} />
            </div>
          ))}
        </div>
      )}
      {canEdit ? (
        <div className="py-2">
          {activeInlineIndex === day.activities.length ? (
            <InlineCard
              dayId={day.id}
              insertIndex={day.activities.length}
              onClose={handleCloseInline}
              onAdvanceInline={handleAdvanceInline}
            />
          ) : (
            <AddCardButton
              dayId={day.id}
              insertIndex={day.activities.length}
              onInlineOpen={handleOpenInline}
              isInlineOpen={activeInlineIndex === day.activities.length}
              isHidden={activeInlineIndex !== null}
            />
          )}
        </div>
      ) : null}
    </section>
  );
}
