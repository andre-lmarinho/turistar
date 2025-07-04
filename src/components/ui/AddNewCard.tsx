// src/components/ui/AddNewCard.tsx
'use client';

import React from 'react';
import { FiPlus } from 'react-icons/fi';

interface AddNewCardProps {
  /** Tailwind “bg-…” color class from your DEFAULT_COLORS palette */
  colorClass: string;
  /** ID of the day where the new card will be added */
  dayId: string;
  /** Callback to create and select the new blank card */
  onAddNew: (dayId: string) => void;
}

/**
 * Clickable button to create a new activity card.
 * - Full width, clean design, no border.
 * - Shows a plus icon and "New Card" text.
 * - On click: triggers the parent callback to create and open the card for this specific day.
 */
export default function AddNewCard({ colorClass, dayId, onAddNew }: AddNewCardProps) {
  return (
    <button
      type="button"
      onClick={() => onAddNew(dayId)}
      className="p-2 cursor-pointer flex items-center w-full h-10 rounded-lg bg-white hover:bg-gray-200 transition"
    >
      {/* Plus icon, using the provided color class */}
      <FiPlus className={`${colorClass.replace(/^bg-/, 'text-')} mr-2`} />

      {/* Button label */}
      <span className="text-sm font-medium">New Card</span>
    </button>
  );
}
