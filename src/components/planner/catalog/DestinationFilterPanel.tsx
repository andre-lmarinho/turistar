// src/components/planner/catalog/DestinationFilterPanel.tsx
'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  DestinationHeader,
  DestinationCardGrid,
  CategoryFilterBar,
  Spinner,
  Modal,
} from '@/components';
import { GEOAPIFY_CATEGORIES } from '@/lib';
import type { CatalogActivity } from '@/types';
import { useDestinationCatalog, useEscapeKey } from '@/hooks';

interface DestinationFilterPanelProps {
  isOpen: boolean;
  dest: string;
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
  dest,
  addedIds = new Set<string>(),
}: DestinationFilterPanelProps) {
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const toggleCat = (cat: string) =>
    setSelectedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });

  const { visibleItems, loading, error, search, setSearch } = useDestinationCatalog(
    isOpen && submitted,
    Array.from(selectedCats),
    dest
  );

  useEscapeKey({ onClose, isActive: isOpen });
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

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      overlayClassName="backdrop-overlay"
      aria-labelledby="destination-filter-title"
      className="bg-background focus:ring-primary relative flex h-[90vh] w-[95vw] max-w-[1350px] flex-col rounded-lg shadow-xl focus:ring-2 focus:outline-none"
    >
      {/* header */}
      <DestinationHeader search={search} onSearchChange={setSearch} onClose={onClose} />

      {!submitted && (
        <div className="flex items-center justify-between gap-2 border-b px-4 py-2">
          <div className="flex-1 overflow-x-auto">
            <CategoryFilterBar
              categories={GEOAPIFY_CATEGORIES}
              active={selectedCats}
              onToggle={toggleCat}
            />
          </div>
          <button
            type="button"
            disabled={selectedCats.size === 0}
            onClick={() => setSubmitted(true)}
            className="rounded border px-3 py-1 text-sm"
          >
            Search
          </button>
        </div>
      )}
      {submitted && (
        <div className="flex items-center gap-2 border-b px-4 py-2">
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="rounded border px-3 py-1 text-sm"
          >
            Back
          </button>
        </div>
      )}

      {submitted && (
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
      )}
    </Modal>
  );
}
