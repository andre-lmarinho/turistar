// src/components/planner/dnd/SortableItem.tsx
'use client';

import React from 'react';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';

import { cn } from '@/lib';
import { ActivityCard } from '@/components';
import type { Activity } from '@/types';

export interface SortableItemProps {
  id: string;
  activity: Activity;
  onSelect?: () => void;
  onTitleSave?: (newTitle: string) => void;
  dragOverlay?: boolean;
  className?: string;
}

export function SortableItem({
  id,
  activity,
  onSelect,
  onTitleSave,
  dragOverlay = false,
  className,
}: SortableItemProps) {
  if (dragOverlay) {
    return (
      <div className={cn('shadow-lg cursor-grabbing', className)}>
        <ActivityCard activity={activity} onSelect={onSelect} onTitleSave={onTitleSave} />
      </div>
    );
  }

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id,
  });

  // Apply transform/transition unless we're in the overlay
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
        isDragging
          ? dragOverlay
            ? 'shadow-lg cursor-grabbing'
            : 'opacity-50 cursor-grabbing'
          : 'cursor-grab',
        className
      )}
      {...attributes}
      {...listeners}
    >
      <ActivityCard activity={activity} onSelect={onSelect} onTitleSave={onTitleSave} />
    </li>
  );
}
