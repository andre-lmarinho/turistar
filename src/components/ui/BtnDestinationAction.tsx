// src/components/ui/BtnDestinationAction.tsx
'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

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
      <Button
        onClick={onRemove}
        className="mt-auto flex items-center justify-center gap-1"
        style={{ backgroundColor: 'var(--secondary)', color: 'var(--secondary-foreground)' }}
      >
        <Check className="w-4 h-4" />
        Added
      </Button>
    );
  }

  return (
    <Button
      onClick={(e) => {
        e.stopPropagation();
        onAdd();
      }}
      className="mt-auto"
      style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
    >
      Add to Planner
    </Button>
  );
}
