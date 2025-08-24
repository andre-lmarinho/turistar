// src/features/planner/components/catalog/DestinationFilterPanel.tsx
'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { DestinationHeader, DestinationResultsList, CategoryFilterBar } from '@/features/planner';
import { Modal } from '@/shared/ui';
import type { CatalogActivity } from '@/shared/types';
import { useDestinationCatalog, useActivitiesById, usePlannerContext } from '@/features/planner';
import { DEFAULT_COLORS, DEFAULT_NEW_CARD_COLOR_INDEX } from '@/shared/constants';

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
  const { planId, dest, days, addActivity, removeActivity } = usePlannerContext();
  const activitiesById = useActivitiesById(days);
  const addedIds = useMemo(() => new Set<string>(Object.keys(activitiesById)), [activitiesById]);
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const { activities, categories, loading, error } = useDestinationCatalog(isOpen, planId, dest);

  const toggleCat = (cat: string) =>
    setSelectedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });

  const visibleItems = useMemo(() => {
    const searchLower = search.toLowerCase();
    return activities
      .filter(
        (it) =>
          (!selectedCats.size || selectedCats.has(it.category)) &&
          it.name.toLowerCase().includes(searchLower)
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [activities, search, selectedCats]);

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
      category: a.category,
      description: a.description,
      startTime: undefined,
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
      <DestinationHeader onClose={onClose} />

      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-2">
        <div className="flex-1 overflow-x-auto">
          <CategoryFilterBar categories={categories} active={selectedCats} onToggle={toggleCat} />
        </div>
        <label htmlFor="catalog-search" className="sr-only">
          Search catalog
        </label>
        <input
          id="catalog-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          className="w-48 rounded border px-2 py-1 text-sm"
        />
      </div>

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
    </Modal>
  );
}
