// src/components/planner/catalog/DestinationFilterPanel.tsx
'use client';

import React from 'react';
import ReactDOM from 'react-dom';
import FocusTrap from 'focus-trap-react';
import { DestinationHeader, DestinationCardGrid, Spinner } from '@/components';
import type { CatalogActivity } from '@/types';
import { useDestinationFilter, useEscapeKey } from '@/hooks';

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
  const {
    visibleItems,
    categories,
    sortMode,
    setSortMode,
    toggleCat,
    activeCats,
    loading,
    error,
    search,
    setSearch,
  } = useDestinationFilter(isOpen);

  useEscapeKey({ onClose, isActive: isOpen });

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="backdrop-overlay flex items-center justify-center" onClick={onClose}>
      <FocusTrap
        active={isOpen}
        focusTrapOptions={{
          clickOutsideDeactivates: true,
          escapeDeactivates: false,
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="destination-filter-title"
          tabIndex={-1}
          className="relative w-[95vw] h-[90vh] max-w-[1350px] bg-background rounded-lg shadow-xl flex flex-col focus:outline-none focus:ring-2 focus:ring-primary"
          onClick={(e) => e.stopPropagation()}
        >
          {/* header rows */}
          <DestinationHeader
            categories={categories}
            activeCats={activeCats}
            toggleCat={toggleCat}
            sortMode={sortMode}
            setSortMode={setSortMode}
            search={search}
            onSearchChange={setSearch}
            onClose={onClose}
          />

          {/* sidebar + cards */}
          <div className="flex-1 flex overflow-auto">
            <div className="flex-1 p-6">
              {loading && (
                <div className="flex items-center gap-2">
                  <Spinner />
                  <span>Loading catalog...</span>
                </div>
              )}
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
      </FocusTrap>
    </div>,
    document.body
  );
}
