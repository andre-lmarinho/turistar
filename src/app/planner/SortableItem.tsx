// src/components/planner/SortableItem.tsx
"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ActivityCard from "./ActivityCard";
import type { Activity } from "@/types/itinerary";

interface SortableItemProps {
  activity: Activity; // data for the card
  id: string;         // unique ID for dnd-kit
}

export default function SortableItem({ activity, id }: SortableItemProps) {
  /* dnd-kit sortable hook */
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  /* Inline style for smooth drag animation */
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ActivityCard activity={activity} />
    </li>
  );
}
