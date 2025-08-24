// src/features/planner/components/dnd/SortableItem.tsx
'use client';

import React from 'react';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';

import { cn } from '@/shared/utils';
import { ActivityCard } from '@/features/planner';
import type { Activity, DayPlan } from '@/shared/types';

export interface SortableItemProps {
  id: string;
  activity: Activity & { dayId?: string };
  availableDays: DayPlan[];
  onSelect?: () => void;
  onTitleSave?: (newTitle: string) => void;
  dragOverlay?: boolean;
  className?: string;
  onChangeDay: (dayId: string) => void;
  onChangePosition: (index: number) => void;
  onChangeColor: (color: string) => void;
  bgColor: string;
  onDelete: () => void;
  onUpdateImage?: (url: string) => void;
}

export default function SortableItem({
  id,
  activity,
  availableDays,
  onSelect,
  onTitleSave,
  onChangeDay,
  onChangePosition,
  onChangeColor,
  onDelete,
  onUpdateImage,
  bgColor,
  dragOverlay = false,
  className,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  if (dragOverlay) {
    return (
      <div
        className={cn(
          'bg-background pointer-events-none origin-bottom rotate-[3deg] cursor-grabbing rounded-lg opacity-90 backdrop-blur-md transition-transform duration-200 ease-out',
          className
        )}
      >
        <ActivityCard
          activity={activity}
          availableDays={availableDays}
          onSelect={onSelect}
          onTitleSave={onTitleSave}
          onChangeDay={onChangeDay}
          onChangePosition={onChangePosition}
          onChangeColor={onChangeColor}
          onDelete={onDelete}
          onUpdateImage={onUpdateImage}
          bgColor={bgColor}
        />
      </div>
    );
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative list-none',
        isDragging ? 'cursor-grabbing' : 'cursor-grab',
        className
      )}
      {...attributes}
      {...listeners}
      role="listitem"
    >
      <div className={cn(isDragging && 'opacity-0')}>
        <ActivityCard
          activity={activity}
          availableDays={availableDays}
          onSelect={onSelect}
          onTitleSave={onTitleSave}
          onChangeDay={onChangeDay}
          onChangePosition={onChangePosition}
          onChangeColor={onChangeColor}
          onDelete={onDelete}
          onUpdateImage={onUpdateImage}
          bgColor={bgColor}
        />
      </div>
      {isDragging && (
        <div className="bg-background border-border absolute inset-0 rounded-lg border-2 border-dashed" />
      )}
    </div>
  );
}
