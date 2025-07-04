// src/components/planner/AddNewCard.tsx
'use client';

import React from 'react';
import { FaPlus } from 'react-icons/fa';

interface AddNewCardProps {
  /** Tailwind “bg-…” color class from your DEFAULT_COLORS palette */
  colorClass: string;
  /** Callback to actually “add” the new blank card */
  onClick: () => void;
}

/**
 * A dashed-border card with a “+” icon for creating a new activity.
 * Border color is derived from the provided bg-… class.
 */
export default function AddNewCard({ colorClass, onClick }: AddNewCardProps) {
  // derive the matching border color class, e.g. "bg-amber-100" → "border-amber-100"
  const borderClass = colorClass.replace(/^bg-/, 'border-');

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center w-32 h-12 border-2 border-dashed ${borderClass} rounded-lg bg-white hover:bg-gray-50 transition`}
    >
      <FaPlus className={`text-2xl ${colorClass.replace(/^bg-/, 'text-')}`} />
    </button>
  );
}
