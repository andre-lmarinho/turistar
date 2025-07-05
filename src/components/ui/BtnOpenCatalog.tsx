// src/components/ui/BtnOpenCatalog.tsx
'use client';

import React from 'react';
import { FiCompass } from 'react-icons/fi';
import { Button } from '@/components/ui/button';

interface OpenPanelButtonProps {
  onClick: () => void;
  title?: string;
}

export default function OpenPanelButton({
  onClick,
  title = 'Add Adventures',
}: OpenPanelButtonProps) {
  return (
    <Button onClick={onClick} aria-label={title} className="flex items-center gap-2">
      <FiCompass size={18} className="transform transition duration-300" />
      <span className="text-sm font-medium whitespace-nowrap">{title}</span>
    </Button>
  );
}
