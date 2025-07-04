// src/components/ui/CloseButton.tsx
'use client';

import React from 'react';
import { X } from 'lucide-react';

/**
 * Animated “X” close button.
 * On hover: scale 110 % + rotate –90 deg (same as Trivia effect).
 */
export default function CloseButton({
  onClick,
  title = 'Close',
}: {
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={title}
      className="cursor-pointer relative w-8 h-8 backdrop-blur-sm rounded
          border border-bg-gray-200 hover:bg-gray-200
          flex items-center justify-center focus:outline-none focus:ring-2
          transition-transform"
    >
      <X size={20} className="transform transition duration-300" />
    </button>
  );
}
