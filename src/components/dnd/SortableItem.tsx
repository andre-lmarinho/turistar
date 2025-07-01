// src/components/dnd/SortableItem.tsx
"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

interface SortableItemProps extends PropsWithChildren<{
  /** Unique identifier for this draggable item */
  id: string;
  /** Render as plain div (no list bullet) when in overlay */
  dragOverlay?: boolean;
  /** Additional CSS classes */
  className?: string;
}> {}

/**
 * A draggable card that renders as <li> in lists,
 * and as <div> in the overlay to avoid list markers.
 */
export function SortableItem({
  id,
  dragOverlay = false,
  className,
  children,
}: SortableItemProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  // During overlay drag, let DnD kit position the element itself
  const style = dragOverlay
    ? {}
    : { transform: CSS.Transform.toString(transform), transition };

  // Switch tag to avoid bullets in overlay
  const Tag = dragOverlay ? "div" : "li";

  return (
    <Tag
      ref={setNodeRef}
      style={style}
      className={cn(
        // base card styles
        "rounded-md border p-3 shadow-sm bg-card select-none",
        // dragging styles
        isDragging
          ? dragOverlay
            ? "shadow-lg cursor-grabbing"
            : "opacity-50 cursor-grabbing"
          : "cursor-grab",
        className
      )}
      {...attributes}
      {...listeners}
    >
      {children}
    </Tag>
  );
}
