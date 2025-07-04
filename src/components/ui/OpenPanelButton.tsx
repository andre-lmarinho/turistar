// src/components/planner/OpenPanelButton.tsx
'use client';

import React from 'react';
import { FiCompass } from 'react-icons/fi';

interface OpenPanelButtonProps {
  onClick: () => void;
  title?: string;
}

export default function OpenPanelButton({
  onClick,
  title = 'Add Adventures',
}: OpenPanelButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={title}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
    >
      <FiCompass size={18} className="transform transition duration-300" />
      <span className="text-sm font-medium whitespace-nowrap">{title}</span>{' '}
      {/* ✅ Prevents text wrap */}
    </button>
  );
}
