// src/components/planner/dnd/SortableItem.tsx
'use client';

import React from 'react';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';

import { cn } from '@/lib';
import { ActivityCard } from '@/components';
import type { Activity, DayPlan } from '@/types';

export interface SortableItemProps {
  id: string;
  activity: Activity & { dayId?: string };
  availableDays: DayPlan[];
  onSelect?: () => void;
  onTitleSave?: (newTitle: string) => void;
  dragOverlay?: boolean;
  className?: string;
  onChangeDay: (dayId: string) => void;
  onChangeColor: (color: string) => void;
  bgColor: string;
}

export function SortableItem({
  id,
  activity,
  availableDays,
  onSelect,
  onTitleSave,
  onChangeDay,
  onChangeColor,
  bgColor,
  dragOverlay = false,
  className,
}: SortableItemProps) {
  // Render as overlay when dragging
  if (dragOverlay) {
    return (
      <div className={cn('shadow-lg cursor-grabbing', className)}>
        <ActivityCard
          activity={activity}
          availableDays={availableDays}
          onSelect={onSelect}
          onTitleSave={onTitleSave}
          onChangeDay={onChangeDay}
          onChangeColor={onChangeColor}
          bgColor={bgColor}
        />
      </div>
    );
  }

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        'list-none',
        isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab',
        className
      )}
      {...attributes}
      {...listeners}
    >
      <ActivityCard
        activity={activity}
        availableDays={availableDays}
        onSelect={onSelect}
        onTitleSave={onTitleSave}
        onChangeDay={onChangeDay}
        onChangeColor={onChangeColor}
        bgColor={bgColor}
      />
    </li>
  );
}
