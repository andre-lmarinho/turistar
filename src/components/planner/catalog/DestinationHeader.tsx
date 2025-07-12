// src/components/planner/catalog/DestinationHeader.tsx
'use client';

import React from 'react';
import { CloseButton, CategoryFilterBar, SortSelector, SortMode } from '@/components';

interface DestinationHeaderProps {
  categories: string[];
  activeCats: Set<string>;
  toggleCat: (c: string) => void;
  sortMode: SortMode;
  setSortMode: (m: SortMode) => void;
  onClose: () => void;
}

export default function DestinationHeader({
  categories,
  activeCats,
  toggleCat,
  sortMode,
  setSortMode,
  onClose,
}: DestinationHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <h3 id="destination-filter-title" className="font-bold text-2xl text-center flex-1">
          Search Your Adventures
        </h3>{' '}
        <CloseButton onClick={onClose} />
      </div>

      <div className="flex items-center justify-between px-4 py-2 border-b gap-2">
        <div className="flex-1 overflow-x-auto">
          <CategoryFilterBar categories={categories} active={activeCats} onToggle={toggleCat} />
        </div>
        <SortSelector value={sortMode} onChange={setSortMode} />
      </div>
    </>
  );
}
