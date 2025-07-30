// src/components/planner/catalog/DestinationFilterPanel.tsx
'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { DestinationHeader, CategorySelection, DestinationResultsList, Modal } from '@/components';
import { GEOAPIFY_CATEGORIES } from '@/lib';
import type { CatalogActivity } from '@/types';
import { useDestinationCatalog, useEscapeKey, useActivitiesById } from '@/hooks';
import { usePlannerContext } from '@/contexts';
import { DEFAULT_COLORS, DEFAULT_NEW_CARD_COLOR_INDEX } from '@/constants';

interface DestinationFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Catalog popup with filtering and sorting.
 * - Displays catalog items to add to the planner.
 * - Works exclusively with CatalogActivity data.
 */
export default function DestinationFilterPanel({ isOpen, onClose }: DestinationFilterPanelProps) {
  const { dest, days, addActivity, removeActivity } = usePlannerContext();
  const activitiesById = useActivitiesById(days);
  const addedIds = useMemo(() => new Set<string>(Object.keys(activitiesById)), [activitiesById]);
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
    addActivity({
      id: a.id,
      title: a.name,
      imageUrl: a.imageUrl,
      address: a.address,
      latitude: a.latitude,
      longitude: a.longitude,
      color: DEFAULT_COLORS[DEFAULT_NEW_CARD_COLOR_INDEX].bg,
      startTime: '',
    });
  };

  const handleRemove = (id: string) => {
    scrollPosRef.current = scrollRef.current?.scrollTop ?? 0;
    removeActivity(id);
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
        <CategorySelection
          categories={GEOAPIFY_CATEGORIES}
          active={selectedCats}
          onToggle={toggleCat}
          onSearch={() => setSubmitted(true)}
        />
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
        <div ref={scrollRef} className="flex flex-1 overflow-auto">
          <DestinationResultsList
            loading={loading}
            error={error}
            items={visibleItems}
            addedIds={addedIds}
            onAdd={handleAdd}
            onRemove={handleRemove}
          />
        </div>
      )}
    </Modal>
  );
}
