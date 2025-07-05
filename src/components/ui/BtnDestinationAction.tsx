// src/components/ui/BtnDestinationAction.tsx
'use client';

import React from 'react';
import { FaCheck } from 'react-icons/fa';
import { Button } from '@/components/ui/button';

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
        variant="secondary"
        className="mt-auto flex items-center justify-center gap-1"
      >
        <FaCheck />
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
    >
      Add to Planner
    </Button>
  );
}
