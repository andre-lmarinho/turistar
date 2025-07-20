// src/components/ui/button-especials/DestinationAction.tsx
'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface DestinationActionButtonProps {
  added: boolean;
  onAdd: () => void;
  onRemove: () => void;
}

export default function DestinationActionButton({
  added,
  onAdd,
  onRemove,
}: DestinationActionButtonProps) {
  if (added) {
    return (
      <button
        onClick={onRemove}
        className="mt-auto px-4 py-2 rounded cursor-pointer flex items-center justify-center gap-1 hover:opacity-80 focus:ring focus:ring-[var(--ring)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
        style={{
          backgroundColor: 'var(--secondary)',
          color: 'var(--secondary-foreground)',
        }}
      >
        <Check aria-hidden="true" />
        Added
      </button>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onAdd();
      }}
      className="mt-auto px-4 py-2 cursor-pointer rounded hover:opacity-80"
      style={{
        backgroundColor: 'var(--primary)',
        color: 'var(--primary-foreground)',
      }}
    >
      Add to Planner
    </button>
  );
}
