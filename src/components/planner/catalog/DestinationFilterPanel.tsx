// src/components/planner/catalog/DestinationFilterPanel.tsx
'use client';

import React, { useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import FocusTrap from 'focus-trap-react';
import { DestinationHeader, DestinationCardGrid, Spinner } from '@/components';
import type { CatalogActivity } from '@/types';
import { useDestinationCatalog, useEscapeKey } from '@/hooks';

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
  } = useDestinationCatalog(isOpen);

  useEscapeKey({ onClose, isActive: isOpen });

  const containerRef = useRef<HTMLDivElement>(null);
  // Preserve scroll position so the list doesn't jump after adding/removing
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const scrollPosRef = useRef(0);

  const handleAdd = (a: CatalogActivity) => {
    scrollPosRef.current = scrollRef.current?.scrollTop ?? 0;
    onAdd(a);
  };

  const handleRemove = (id: string) => {
    scrollPosRef.current = scrollRef.current?.scrollTop ?? 0;
    onRemove(id);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollPosRef.current;
    }
  }, [addedIds]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="backdrop-overlay flex items-center justify-center" onClick={onClose}>
      <FocusTrap
        active={isOpen}
        focusTrapOptions={{
          clickOutsideDeactivates: true,
          escapeDeactivates: false,
          initialFocus: false,
          fallbackFocus: () => containerRef.current ?? document.body,
          returnFocusOnDeactivate: false,
          tabbableOptions: { displayCheck: 'none' },
        }}
      >
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="destination-filter-title"
          tabIndex={-1}
          className="bg-background focus:ring-primary relative flex h-[90vh] w-[95vw] max-w-[1350px] flex-col rounded-lg shadow-xl focus:ring-2 focus:outline-none"
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

          <div className="flex flex-1 overflow-auto" ref={scrollRef}>
            <div className="flex-1 p-4">
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
                  onAdd={handleAdd}
                  onRemove={handleRemove}
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
