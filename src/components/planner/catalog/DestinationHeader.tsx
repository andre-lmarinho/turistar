// src/components/planner/catalog/DestinationHeader.tsx
'use client';

import React from 'react';
import { CloseButton } from '@/components';

interface DestinationHeaderProps {
  search: string;
  onSearchChange: (s: string) => void;
  onClose: () => void;
}

export default function DestinationHeader({
  search,
  onSearchChange,
  onClose,
}: DestinationHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h3 id="destination-filter-title" className="flex-1 text-center text-2xl font-bold">
          Search Your Adventures
        </h3>
        <CloseButton onClick={onClose} />
      </div>

      <div className="flex items-center gap-2 border-b px-4 py-2">
        <label htmlFor="catalog-search" className="sr-only">
          Search catalog
        </label>
        <input
          id="catalog-search"
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search"
          className="w-full rounded border px-2 py-1 text-sm"
        />
      </div>
    </>
  );
}
