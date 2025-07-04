// src/components/ui/Icon - Close.tsx
'use client';

import React from 'react';
import { X } from 'lucide-react';

/**
 * Animated “X” close button.
 * On hover: scale 110 % + rotate –90 deg
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
      className="cursor-pointer bg-background relative group w-8 h-8 backdrop-blur-sm rounded
          border border-bg-gray-200 hover:bg-gray-200
          flex items-center justify-center focus:outline-none focus:ring-2
          transition-transform hover:scale-110"
    >
      <X
        size={20}
        className="transform transition duration-300 group-hover:scale-105 group-hover:rotate-90"
      />
    </button>
  );
}
