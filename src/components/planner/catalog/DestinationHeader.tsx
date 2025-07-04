// src/components/planner/catalog/DestinationHeader.tsx
'use client';

import React from 'react';
import CitySwitcher from '@/components/planner/catalog/CitySwitcher';
import CloseButton from '@/components/ui/IcoClose';
import SettingsToggleButton from '@/components/ui/IcoSettingsToggle';
import CategoryFilterBar from '@/components/planner/catalog/CategoryFilterBar';
import SortSelector, { SortMode } from '@/components/planner/catalog/SortSelector';

interface DestinationHeaderProps {
  city: string;
  onChangeCity: (c: string) => void;
  categories: string[];
  activeCats: Set<string>;
  toggleCat: (c: string) => void;
  sortMode: SortMode;
  setSortMode: (m: SortMode) => void;
  onToggleSidebar: () => void;
  onClose: () => void;
}

export default function DestinationHeader({
  city,
  onChangeCity,
  categories,
  activeCats,
  toggleCat,
  sortMode,
  setSortMode,
  onToggleSidebar,
  onClose,
}: DestinationHeaderProps) {
  return (
    <>
      {/* Row 1 */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <CitySwitcher city={city} onChangeCity={onChangeCity} />
        <CloseButton onClick={onClose} />
      </div>

      {/* Row 2 */}
      <div className="flex items-center justify-between px-4 py-2 border-b gap-2">
        <SettingsToggleButton onClick={onToggleSidebar} />

        <div className="flex-1 overflow-x-auto">
          <CategoryFilterBar categories={categories} active={activeCats} onToggle={toggleCat} />
        </div>

        <SortSelector value={sortMode} onChange={setSortMode} />
      </div>
    </>
  );
}
