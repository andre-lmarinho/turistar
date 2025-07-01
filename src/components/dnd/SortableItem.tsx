// src/components/dnd/SortableItem.tsx
"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

/**
 * Props for a draggable SortableItem:
 * - id: unique identifier
 * - dragOverlay: render as <div> in overlay (no list bullets)
 * - className: extra CSS classes
 */
export type SortableItemProps = PropsWithChildren<{
  id: string;
  dragOverlay?: boolean;
  className?: string;
}>;

/**
 * A draggable card:
 * - <li> in normal lists
 * - <div> in the DragOverlay (avoids default list markers)
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

  // Overlay follows pointer; normal uses CSS transform
  const style = dragOverlay
    ? {}
    : { transform: CSS.Transform.toString(transform), transition };

  const Tag = dragOverlay ? "div" : "li";

  return (
    <Tag
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-md border p-3 shadow-sm bg-card select-none",
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
