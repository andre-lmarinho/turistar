// src/components/dnd/planer/SortableItem.tsx
'use client';

import React from 'react';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import ActivityCard from '@/components/planner/dnd/ActivityCard';
import type { Activity } from '@/types/itinerary';

/**
 * A draggable wrapper around an ActivityCard:
 * - Renders as <li> in the day columns
 * - Renders as <div> in the drag overlay
 * - Handles dnd-kit attributes, listeners, and styles
 */
export interface SortableItemProps {
  id: string; // unique identifier for dnd-kit
  activity: Activity; // data to display in the card
  onSelect?: () => void; // click handler to open edit modal
  onTitleSave?: (newTitle: string) => void; // inline title save
  dragOverlay?: boolean; // true → use <div> for overlay
  className?: string; // additional CSS classes
}

export function SortableItem({
  id,
  activity,
  onSelect,
  onTitleSave,
  dragOverlay = false,
  className,
}: SortableItemProps) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id,
  });

  // Apply transform/transition unless we're in the overlay
  const style = dragOverlay ? {} : { transform: CSS.Transform.toString(transform), transition };

  // Use <div> for overlay so no list bullets; otherwise <li>
  const Tag = dragOverlay ? 'div' : 'li';

  return (
    <Tag
      ref={setNodeRef}
      style={style}
      className={cn(
        // dragging styles
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
      {/* Render the activity card; clicking it opens the edit modal */}
      <ActivityCard activity={activity} onSelect={onSelect} onTitleSave={onTitleSave} />
    </Tag>
  );
}
