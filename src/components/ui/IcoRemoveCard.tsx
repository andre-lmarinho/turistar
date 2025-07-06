// src/components/ui/IcoRemoveCard.tsx
'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';

/**
 * Floating round-red button used by cards that are already in the planner.
 * Caller decides placement via `className`.
 */
export default function RemoveCardButton({
  onClick,
  title = 'Remove from planner',
}: {
  onClick: () => void;
  title?: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={title}
      className="cursor-pointer bg-background relative w-8 h-8 backdrop-blur-sm rounded
          border border-bg-gray-200 hover:bg-gray-200
          flex items-center justify-center focus:outline-none focus:ring-2
          transition-transform duration-300 hover:scale-110"
    >
      <Trash2 size={18} className="transform transition duration-300 group:hover:scale-105" />
    </button>
  );
}
