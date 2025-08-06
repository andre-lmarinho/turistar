// src/components/planner/catalog/DestinationHeader.tsx
'use client';

import React from 'react';
import { CloseButton } from '@/shared/ui';

interface DestinationHeaderProps {
  onClose: () => void;
}

export default function DestinationHeader({ onClose }: DestinationHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b px-4 py-2">
      <h3 id="destination-filter-title" className="flex-1 text-center text-2xl font-bold">
        Search Your Adventures
      </h3>
      <CloseButton onClick={onClose} />
    </div>
  );
}
