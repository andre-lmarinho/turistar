// src/server/repos/catalog.persist.ts

import { supabaseServer } from '@/shared/lib/supabaseServer';
import type { WikimediaSignals } from '@/shared/lib/wikimedia';

/**
 * Persist Wikimedia signals for a catalog item.
 * Errors are logged but do not throw to keep API responses reliable.
 */
export async function persistWikimediaEnrichment(params: {
  catalogId: string;
  wiki: WikimediaSignals | undefined;
}) {
  if (!params?.wiki || !params.catalogId) return;

  const { title, imageUrl, description, wikidataQid, source } = params.wiki;

  const supabase = supabaseServer(); // TODO: consider service role for RLS bypass

  const { error } = await supabase
    .from('catalog')
    .update({
      wikidata_qid: wikidataQid ?? null,
      wikimedia_title: title ?? null,
      wikimedia_source: source ?? null,
      image_url: imageUrl ?? null,
      description: description ?? null,
      // pageviews_30d: will be populated in a future commit
      wikimedia_fetched_at: new Date().toISOString(),
      // image_confidence: left null for future "confidence gate" work
    })
    .eq('id', params.catalogId);

  if (error) {
    // Fail silently; enrichment persistence should not break catalog reads
    console.warn('persistWikimediaEnrichment error', error);
  }
}
