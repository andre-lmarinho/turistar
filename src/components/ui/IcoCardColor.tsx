// src/components/ui/IcoCardColor.tsx
'use client';

import React from 'react';
import { Palette } from 'lucide-react';

export default function CardColorButton({
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
      className="group cursor-pointer bg-background relative w-8 h-8 backdrop-blur-sm rounded
    border border-bg-gray-200 hover:bg-gray-200
    flex items-center justify-center focus:outline-none focus:ring-2
    transition-transform duration-300 hover:scale-110"
    >
      {/* Tooltip */}
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 text-nowrap group-hover:opacity-100 transition-opacity">
        Card Color
      </div>

      {/* Icon */}
      <Palette size={18} className="transform transition duration-300 group-hover:scale-105" />
    </button>
  );
}
