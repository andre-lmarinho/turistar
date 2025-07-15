// src/hooks/useDestinationCatalog.ts

import { useState, useEffect, useMemo } from 'react';
import type { SortMode } from '@/components/planner/catalog/SortSelector';
import type { CatalogActivity } from '@/types';

/**
 * Hook to fetch and manage the catalog activities.
 * - Loads catalog activities by destination from the API.
 * - Provides category-based filtering and sorting.
 * - Handles loading and error states.
 */

export function useDestinationCatalog(isOpen: boolean, city = 'salvador') {
  // Catalog activities list (raw from API)
  const [items, setItems] = useState<CatalogActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCats, setActiveCats] = useState<Set<string>>(new Set());
  const [sortMode, setSortMode] = useState<SortMode>('A-Z');
  const [search, setSearch] = useState('');

  /**
   * Fetch the catalog from the API when the panel is open and not already loaded.
   */
  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    setError(null);

    fetch(`/api/catalog?dest=${city}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: { activities: CatalogActivity[] }) => {
        // Store activities in the catalog format
        setItems(data.activities);
      })
      .catch(() => setError('Failed to load catalog.'))
      .finally(() => setLoading(false));
  }, [isOpen, city]);

  /**
   * Returns a filtered and sorted list of activities.
   * - Filters by active categories if any are selected.
   * - Sorts by price, duration, or name.
   */
  const visibleItems = useMemo(() => {
    const catFiltered =
      activeCats.size === 0 ? items : items.filter((it) => activeCats.has(it.category));

    const searchLower = search.toLowerCase();
    const filtered = catFiltered.filter(
      (it) =>
        it.name.toLowerCase().includes(searchLower) ||
        it.description.toLowerCase().includes(searchLower)
    );

    return [...filtered].sort((a, b) => {
      switch (sortMode) {
        case 'Price':
          return a.price.localeCompare(b.price);
        case 'Duration':
          return a.duration - b.duration;
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [items, activeCats, sortMode, search]);

  /**
   * Builds the list of unique categories from the catalog.
   */
  const categories = useMemo(() => [...new Set(items.map((i) => i.category))], [items]);

  /**
   * Toggles a category selection.
   */
  const toggleCat = (cat: string) =>
    setActiveCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });

  return {
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
  };
}
