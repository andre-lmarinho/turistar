// src/features/planner/hooks/catalog/useCatalogActivities.ts
'use client';

import { useEffect, useState } from 'react';
import type { CatalogActivity } from '@/shared/types';
import type { Database } from '@/shared/types/supabase';
import { supabase } from '@/shared/lib/supabaseClient';
import { fetchCatalog } from './fetchCatalog';

/**
 * Loads catalog activities for the given plan from Supabase or the API.
 * Falls back to fetching from the catalog endpoint when not cached.
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
        const { data: links } = (await supabase
          .from('plan_destinations')
          .select('destination_id')
          .eq('plan_id', planId)
          .order('position')) as any;
        const destId = links?.[0]?.destination_id as string | undefined;

        let rows: Database['public']['Tables']['catalog']['Row'][] = [];
        if (destId) {
          const { data } = (await supabase
            .from('catalog')
            .select('*')
            .eq('destination_id', destId)) as any;
          rows = data ?? [];
        }

        if (rows.length) {
          setActivities(
            rows.map((r) => ({
              id: r.id,
              name: r.name,
              category: r.category,
              description: r.description ?? undefined,
              address: r.address ?? undefined,
              imageUrl: r.image_url ?? undefined,
              latitude: r.latitude ?? undefined,
              longitude: r.longitude ?? undefined,
              metadata: (r.metadata as Record<string, unknown> | null) ?? undefined,
            }))
          );
          setError(false);
        } else {
          const { activities: fetched } = await fetchCatalog(dest!);
          setActivities(fetched);
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
