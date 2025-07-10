'use client';

import React from 'react';
import { List, LayoutGrid } from 'lucide-react';

interface ViewToggleButtonProps {
  orientation: 'horizontal' | 'vertical';
  onToggle: () => void;
}

export default function ViewToggleButton({ orientation, onToggle }: ViewToggleButtonProps) {
  const Icon = orientation === 'vertical' ? LayoutGrid : List;
  const label = orientation === 'vertical' ? 'Grid view' : 'List view';

  return (
    <button
      onClick={onToggle}
      className="relative group text-gray-600 hover:text-gray-800 transition-transform hover:scale-110"
      aria-label="Toggle view"
    >
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded text-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        {label}
      </div>
      <Icon size={20} className="transition-transform group-hover:scale-110" />
    </button>
  );
}
