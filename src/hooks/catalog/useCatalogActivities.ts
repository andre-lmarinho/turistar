// src/hooks/useCatalogActivities.ts
'use client';

import { useEffect, useState } from 'react';
import type { CatalogActivity } from '@/types';
import { fetchCatalog } from './fetchCatalog';

/**
 * Loads catalog activities for the given plan from localStorage or the API.
 * Falls back to fetching from the Geoapify proxy when not cached.
 */
export function useCatalogActivities(
  planId: string | null,
  dest: string | null,
  options: { enabled: boolean }
) {
  const [activities, setActivities] = useState<CatalogActivity[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [isError, setError] = useState(false);

  useEffect(() => {
    if (!options.enabled || !planId || !dest) {
      setActivities([]);
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      try {
        const raw = localStorage.getItem(`catalog-${planId}`);
        if (raw) {
          setActivities(JSON.parse(raw));
          setError(false);
        } else {
          const { activities: fetched } = await fetchCatalog(dest!);
          setActivities(fetched);
          localStorage.setItem(`catalog-${planId}`, JSON.stringify(fetched));
          setError(false);
        }
      } catch {
        setActivities([]);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [options.enabled, planId, dest]);

  return { activities, isLoading, isError };
}
