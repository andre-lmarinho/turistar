// src/hooks/useDestinationCatalog.ts

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { SortMode } from '@/components';
import { fetchCatalog } from '@/hooks';

/**
 * Hook to fetch and manage the catalog activities.
 * - Loads catalog activities by destination from the API with React Query.
 * - Provides category-based filtering and sorting.
 * - Handles loading and error states.
 */

export function useDestinationCatalog(isOpen: boolean, city = 'salvador') {
  // Catalog activities list (raw from API)
  const { data, isLoading, isError } = useQuery({
    queryKey: ['catalog', city],
    queryFn: () => fetchCatalog(city, []),
    enabled: isOpen,
  });
  const loading = isLoading;
  const error = isError ? 'Failed to load catalog.' : null;
  const [activeCats, setActiveCats] = useState<Set<string>>(new Set());
  const [sortMode, setSortMode] = useState<SortMode>('A-Z');
  const [search, setSearch] = useState('');

  /**
   * Returns a filtered and sorted list of activities.
   * - Filters by active categories if any are selected.
   * - Sorts by price, duration, or name.
   */
  const visibleItems = useMemo(() => {
    const activities = data?.activities ?? [];
    const catFiltered =
      activeCats.size === 0 ? activities : activities.filter((it) => activeCats.has(it.category));

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
        case 'Rating':
          return (b.rating ?? 0) - (a.rating ?? 0);
        case 'Reviews':
          return Number(b.reviewcount ?? 0) - Number(a.reviewcount ?? 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [data?.activities, activeCats, sortMode, search]);

  /**
   * Builds the list of unique categories from the catalog.
   */
  const categories = useMemo(() => {
    const activities = data?.activities ?? [];
    return [...new Set(activities.map((i) => i.category))];
  }, [data?.activities]);

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
