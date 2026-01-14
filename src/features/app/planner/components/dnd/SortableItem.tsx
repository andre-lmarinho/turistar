"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Activity } from "@/features/app/planner/domain/types/PlannerEntities";
import { cn } from "@/shared/utils/cn";
import { ActivityCard } from "./ActivityCard";

interface SortableItemProps {
  id: string;
  activity: Activity & { dayId?: string };
  onSelect?: () => void;
  dragOverlay?: boolean;
  className?: string;
  bgColor: string;
}

export function SortableItem({
  id,
  activity,
  onSelect,
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
          "bg-background pointer-events-none origin-bottom rotate-3 cursor-grabbing rounded-lg opacity-90 backdrop-blur-md transition-transform duration-200 ease-out",
          className
        )}>
        <ActivityCard activity={activity} onSelect={onSelect} bgColor={bgColor} />
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
        "relative touch-none list-none",
        isDragging ? "cursor-grabbing" : "cursor-grab",
        className
      )}
      {...attributes}
      {...listeners}>
      <div className={cn(isDragging && "opacity-0")}>
        <ActivityCard activity={activity} onSelect={onSelect} bgColor={bgColor} />
      </div>
      {isDragging && (
        <div className="bg-background border-border absolute inset-0 rounded-lg border-2 border-dashed" />
      )}
    </div>
  );
}
