// src/components/planner/dnd/SortableItem.tsx
'use client';

import React from 'react';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';

import { cn } from '@/lib';
import { ActivityCard } from '@/components';
import type { Activity, DayPlan, CatalogActivity } from '@/types';

export interface SortableItemProps {
  id: string;
  dest: string;
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
  onApplyCatalogItem?: (item: CatalogActivity) => void;
}

export default function SortableItem({
  id,
  dest,
  activity,
  availableDays,
  onSelect,
  onTitleSave,
  onChangeDay,
  onChangePosition,
  onChangeColor,
  onDelete,
  onUpdateImage,
  onApplyCatalogItem,
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
          'pointer-events-none cursor-grabbing',
          'origin-bottom rotate-[3deg]',
          'transition-transform duration-200 ease-out',
          'bg-background/70 rounded-lg backdrop-blur-md',
          className
        )}
      >
        <ActivityCard
          activity={activity}
          dest={dest}
          availableDays={availableDays}
          onSelect={onSelect}
          onTitleSave={onTitleSave}
          onChangeDay={onChangeDay}
          onChangePosition={onChangePosition}
          onChangeColor={onChangeColor}
          onDelete={onDelete}
          onUpdateImage={onUpdateImage}
          onApplyCatalogItem={onApplyCatalogItem}
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
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative list-none',
        isDragging ? 'cursor-grabbing' : 'cursor-grab',
        className
      )}
      {...attributes}
      {...listeners}
    >
      <div className={cn(isDragging && 'opacity-0')}>
        <ActivityCard
          activity={activity}
          dest={dest}
          availableDays={availableDays}
          onSelect={onSelect}
          onTitleSave={onTitleSave}
          onChangeDay={onChangeDay}
          onChangePosition={onChangePosition}
          onChangeColor={onChangeColor}
          onDelete={onDelete}
          onUpdateImage={onUpdateImage}
          onApplyCatalogItem={onApplyCatalogItem}
          bgColor={bgColor}
        />
      </div>
      {isDragging && (
        <div className="bg-background absolute inset-0 rounded-lg border-2 border-dashed border-gray-300" />
      )}
    </li>
  );
}
