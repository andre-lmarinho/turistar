// src/components/planner/catalog/DestinationFilterPanel.tsx
'use client';

import React, { useState } from 'react';
import { DestinationHeader, DestinationCardGrid, ConfigSidebar } from '@/components';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Extract filter logic into custom hook
  const { visibleItems, categories, sortMode, setSortMode, toggleCat, activeCats, loading, error } =
    useDestinationFilter(isOpen);

  if (!isOpen) return null;

  return (
    <>
      {/* backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="relative w-[95vw] h-[95vh] max-w-[1350px] bg-white rounded-lg shadow-xl flex flex-col">
          {/* header rows */}
          <DestinationHeader
            city={'salvador'}
            onChangeCity={() => {}}
            categories={categories}
            activeCats={activeCats}
            toggleCat={toggleCat}
            sortMode={sortMode}
            setSortMode={setSortMode}
            onToggleSidebar={() => setSidebarOpen((o) => !o)}
            onClose={onClose}
          />

          {/* sidebar + cards */}
          <div className="flex-1 flex overflow-auto">
            <ConfigSidebar open={sidebarOpen} />

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
