// src/components/ui/Icon - Close.tsx
'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <Button
      onClick={onClick}
      aria-label={title}
      size="icon"
      variant="ghost"
      className="bg-background relative group w-8 h-8 backdrop-blur-sm rounded border border-bg-gray-200 hover:bg-gray-200 focus:outline-none focus:ring-2 transition-transform hover:scale-110"
    >
      <X
        size={20}
        className="transform transition duration-300 group-hover:scale-105 group-hover:rotate-90"
      />
    </Button>
  );
}
