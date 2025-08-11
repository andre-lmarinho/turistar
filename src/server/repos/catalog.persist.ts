// src/server/repos/catalog.persist.ts

import { supabaseServer } from '@/shared/lib/supabaseServer';
import type { CatalogActivity } from '@/shared/types';
import type { WikimediaSignals } from '@/shared/lib/wikimedia';

/**
 * Persist Wikimedia signals for a catalog item.
 * Throws on Supabase errors so callers can handle failures.
 */
export async function persistWikimediaEnrichment(params: {
  item: Pick<CatalogActivity, 'id' | 'name' | 'category' | 'latitude' | 'longitude'> & {
    destination_id?: string | null;
    source?: string | null;
  };
  wiki: WikimediaSignals | undefined;
}) {
  if (!params?.wiki || !params.item?.id) return;

  const { title, imageUrl, description, wikidataQid, source, pageid, pageviews30d, rankScore } =
    params.wiki;
  const {
    id,
    name,
    category,
    latitude,
    longitude,
    destination_id,
    source: itemSource,
  } = params.item;

  const supabase = supabaseServer(); // TODO: consider service role for RLS bypass

  const { data, error } = await supabase
    .from('catalog')
    .upsert(
      {
        id,
        destination_id: destination_id ?? '',
        source: itemSource ?? '',
        name,
        category,
        latitude,
        longitude,
        wikidata_qid: wikidataQid ?? null,
        wikimedia_title: title ?? null,
        wikimedia_source: source ?? null,
        image_url: imageUrl ?? null,
        description: description ?? null,
        wikimedia_pageid: pageid != null ? String(pageid) : null,
        pageviews_30d: pageviews30d ?? null,
        rank_score: rankScore ?? null,
        wikimedia_fetched_at: new Date().toISOString(),
        // image_confidence: left null for future "confidence gate" work
      },
      { onConflict: 'id' }
    )
    .select('id');

  if (error) {
    throw error;
  } else if (!data?.length) {
    console.warn('persistWikimediaEnrichment affected 0 rows');
  }
}
