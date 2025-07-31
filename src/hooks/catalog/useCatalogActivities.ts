// src/hooks/useCatalogActivities.ts
'use client';

import { useEffect, useState } from 'react';
import type { CatalogActivity } from '@/types';

/**
 * Loads catalog activities for the given plan from localStorage.
 * Returns the raw list along with simple loading and error flags.
 */
export function useCatalogActivities(planId: string | null, options: { enabled: boolean }) {
  const [activities, setActivities] = useState<CatalogActivity[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [isError, setError] = useState(false);

  useEffect(() => {
    if (!options.enabled || !planId) {
      setActivities([]);
      setLoading(false);
      return;
    }

    try {
      const raw = localStorage.getItem(`catalog-${planId}`);
      if (raw) {
        setActivities(JSON.parse(raw));
        setError(false);
      } else {
        setActivities([]);
        setError(true);
      }
    } catch {
      setActivities([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [options.enabled, planId]);

  return { activities, isLoading, isError };
}
