// src/hooks/useDestinationFilter.ts
'use client';

import { useState } from 'react';
import { useDestinationCatalog } from '@/hooks';
import { STARTER_PLANNER_TITLE } from '@/constants';

/**
 * Encapsulates catalog filter state and logic.
 * - Used by DestinationFilterPanel to separate UI from behavior.
 */
export function useDestinationFilter(isOpen: boolean) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  return {
    city: STARTER_PLANNER_TITLE,
    sidebarOpen,
    setSidebarOpen,
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
