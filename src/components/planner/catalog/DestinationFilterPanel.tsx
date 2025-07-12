// src/components/planner/catalog/DestinationFilterPanel.tsx
'use client';

import React from 'react';
import { DestinationHeader, DestinationCardGrid } from '@/components';
import type { CatalogActivity } from '@/types';
import { useDestinationFilter } from '@/hooks';

interface DestinationFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (a: CatalogActivity) => void; // Catalog items only
  onRemove: (id: string) => void;
  addedIds?: Set<string>;
}

/**
 * Catalog popup with filtering and sorting.
 * - Displays catalog items to add to the planner.
 * - Works exclusively with CatalogActivity data.
 */
export default function DestinationFilterPanel({
  isOpen,
  onClose,
  onAdd,
  onRemove,
  addedIds = new Set<string>(),
}: DestinationFilterPanelProps) {
  // Extract filter logic into custom hook
  const { visibleItems, categories, sortMode, setSortMode, toggleCat, activeCats, loading, error } =
    useDestinationFilter(isOpen);

  if (!isOpen) return null;

  return (
    <>
      {/* backdrop */}
      <div className="backdrop-overlay" onClick={onClose} />

      {/* popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="destination-filter-title"
          className="relative w-[95vw] h-[90vh] max-w-[1350px] bg-white rounded-lg shadow-xl flex flex-col"
        >
          {/* header rows */}
          <DestinationHeader
            categories={categories}
            activeCats={activeCats}
            toggleCat={toggleCat}
            sortMode={sortMode}
            setSortMode={setSortMode}
            onClose={onClose}
          />

          {/* sidebar + cards */}
          <div className="flex-1 flex overflow-auto">
            <div className="flex-1 p-6">
              {loading && <p>Loading catalog...</p>}
              {error && <p className="text-red-500">{error}</p>}
              {!loading && !error && (
                <DestinationCardGrid
                  items={visibleItems}
                  addedIds={addedIds}
                  onAdd={onAdd}
                  onRemove={onRemove}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
