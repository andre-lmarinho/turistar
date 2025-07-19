// src/components/ui/button-especials/OpenCatalog.tsx

'use client';

import React from 'react';
import { Compass } from 'lucide-react';

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
      className="flex group cursor-pointer items-center gap-2 px-4 py-2 rounded hover:opacity-90 transition-colors"
      style={{
        backgroundColor: 'var(--primary)',
        color: 'var(--primary-foreground)',
      }}
    >
      <Compass
        size={18}
        aria-hidden="true"
        className="group-hover:rotate-135 transform transition duration-300 group-hover/icon:scale-105"
      />
      <span className="text-sm font-medium whitespace-nowrap">{title}</span>
    </button>
  );
}
