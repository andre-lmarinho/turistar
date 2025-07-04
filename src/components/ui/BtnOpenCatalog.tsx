// src/components/ui/BtnOpenCatalog.tsx
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
      className="flex cursor-pointer items-center gap-2 px-4 py-2 rounded hover:opacity-90 transition-colors"
      style={{
        backgroundColor: 'var(--primary)',
        color: 'var(--primary-foreground)',
      }}
    >
      <FiCompass size={18} className="transform transition duration-300" />
      <span className="text-sm font-medium whitespace-nowrap">{title}</span>
    </button>
  );
}
