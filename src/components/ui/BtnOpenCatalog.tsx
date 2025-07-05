// src/components/ui/BtnOpenCatalog.tsx
'use client';

import React from 'react';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface OpenPanelButtonProps {
  onClick: () => void;
  title?: string;
}

export default function OpenPanelButton({
  onClick,
  title = 'Add Adventures',
}: OpenPanelButtonProps) {
  return (
    <Button
      onClick={onClick}
      aria-label={title}
      className="flex cursor-pointer items-center gap-2"
      style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
    >
      <Compass size={18} className="transform transition duration-300" />
      <span className="text-sm font-medium whitespace-nowrap">{title}</span>
    </Button>
  );
}
