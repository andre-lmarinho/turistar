// src/hooks/useDestinationCatalog.ts
'use client';

import { useMemo } from 'react';
import { useCatalogActivities } from './useCatalogActivities';
import type { CatalogActivity } from '@/types';

/**
 * Loads catalog activities for the given plan and derives available categories.
 */
export function useDestinationCatalog(
  enabled: boolean,
  planId: string | null,
  dest: string | null
) {
  const { activities = [], isLoading, isError } = useCatalogActivities(planId, dest, { enabled });

  const categories = useMemo(
    () => Array.from(new Set(activities.map((a: CatalogActivity) => a.category))).sort(),
    [activities]
  );

  return {
    activities,
    categories,
    loading: isLoading,
    error: isError ? 'Failed to load catalog.' : null,
  };
}
